// script.js - Seal Chef's Questionable Recipes
// Full CRUD operations for recipes and comments

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showStatus(msg, type = 'success') {
  const el = $('#statusMsg');
  el.html(`<div class="alert alert-${type} py-2">${msg}</div>`);
  setTimeout(() => el.empty(), 3000);
}

function setLoading(on) {
  $('#loadingIndicator').toggle(on);
}

// ─── READ - Load all recipes from MongoDB ─────────────────────────────────────
// On page load, fetch all recipes and render them to the DOM. Shows loading indicator while fetching.
function loadRecipes() {
  setLoading(true);
  $.get('/api/recipes')
    .done((recipes) => {
      console.log('Loaded recipes:', recipes);
      renderData(recipes);
    })
    .fail((xhr) => {
      console.error('GET /api/recipes failed:', xhr.status, xhr.responseText);
      showStatus('Failed to load recipes.', 'danger');
    })
    .always(() => setLoading(false));
}

// ─── Render recipes to DOM ────────────────────────────────────────────────────
// Uses Bootstrap cards and includes buttons for edit, delete, like, and toggle comments
function renderData(recipes) {
  const container = $('#data-container');
  container.empty();

  if (!recipes.length) {
    container.append('<p class="text-muted">No recipes yet — add one above!</p>');
    return;
  }

  recipes.forEach(entry => {
    const imageHtml = entry.image ? `<div class="col-md-4"><img src="${entry.image}" class="img-fluid rounded" alt="Recipe image" style="object-fit: cover; height: 100%; min-height: 200px; width: 100%;"></div>` : '';
    const colClass = entry.image ? 'col-md-8' : 'col-12';
    const recipeCard = $(`
      <div class="card mb-3" id="list" data-id="${entry._id}">
        <div class="row g-0">
          ${imageHtml}
          <div class="${colClass}">
            <div class="card-body">
              <h4 class="card-title">${escapeHtml(entry.title)}</h4>
              <p><strong>Ingredients:</strong> ${escapeHtml(entry.ingredients)}</p>
              <p><strong>Instructions:</strong> ${escapeHtml(entry.instructions)}</p>
              <div class="d-flex gap-2 align-items-center">
                <button class="btn btn-sm btn-warning editBtn">Edit</button>
                <button class="btn btn-sm btn-danger deleteBtn">Delete</button>
                <button class="btn btn-sm btn-info toggleCommentsBtn">View Comments</button>
                <button class="btn btn-sm btn-success likeBtn"><span class="heart">♥</span> <span class="likeCount">${entry.likes || 0}</span></button>
              </div>
              
              <!-- Comments Section -->
              <div class="comments-section" style="display:none;">
                <h6 class="mt-3">Comments:</h6>
                <div class="comments-list"></div>
                
                <!-- Add Comment Form -->
                <div class="add-comment-form">
                  <input type="text" class="form-control mb-2 commentAuthor" placeholder="Your name">
                  <textarea class="form-control mb-2 commentText" placeholder="Add a comment..." rows="2"></textarea>
                  <button type="button" class="btn btn-sm btn-success addCommentBtn">Post Comment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
    
    container.append(recipeCard);
  });
}

// Escape HTML to prevent XSS
// This function replaces special characters with their HTML entity equivalents to prevent malicious scripts from being executed when rendering user-generated content.
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ─── Load and display comments for a recipe ───────────────────────────────────
// When the "View Comments" button is clicked, this function fetches the comments for the specific recipe and renders them in the comments section. It also handles the case where there are no comments and displays an appropriate message.
// Optional but I wanted to add comments and things to see if they could work.
function loadComments(recipeId, container) {
  $.get(`/api/recipes/${recipeId}/comments`)
    .done((comments) => {
      const commentsList = container.find('.comments-list');
      commentsList.empty();
      
      if (comments.length === 0) {
        commentsList.append('<p class="text-muted">No comments yet.</p>');
        return;
      }
      
      comments.forEach(comment => {
        commentsList.append(`
          <div class="comment">
            <div class="comment-author">${escapeHtml(comment.author)}</div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <small class="text-muted">${new Date(comment.createdAt).toLocaleDateString()}</small>
            <div class="comment-actions">
              <button class="btn btn-sm btn-danger deleteCommentBtn" data-comment-id="${comment._id}">Delete</button>
            </div>
          </div>
        `);
      });
    })
    .fail((xhr) => {
      console.error('Failed to load comments:', xhr);
      container.find('.comments-list').html('<p class="text-danger">Failed to load comments.</p>');
    });
}

// ─── CREATE - POST new recipe ─────────────────────────────────────────────────
// When the form is submitted, this function gathers the input values, sends a POST request to create a new recipe, and then reloads the recipes to show the new entry. It also includes error handling to display a message if the request fails.
$('#dataForm').on('submit', function (e) {
  e.preventDefault();
  const form = this;
  const imageInput = document.getElementById('entryImage');
  const file = imageInput.files[0];

  // Handle image conversion to base64
  function submitRecipe(imageData = null) {
    const recipe = {
      title: $('#entryTitle').val().trim(),
      ingredients: $('#entryIngredients').val().trim(),
      instructions: $('#entryInstructions').val().trim(),
    };

    if (imageData) {
      recipe.image = imageData;
    }

    console.log('Submitting recipe:', recipe);

    $.ajax({
      url: '/api/recipes',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(recipe),
    })
      .done((res) => {
        console.log('POST success:', res);
        showStatus('Recipe added!');
        form.reset();
        loadRecipes();
      })
      .fail((xhr) => {
        console.error('POST failed:', xhr.status, xhr.responseText);
        showStatus(`Failed to add recipe: ${xhr.responseJSON?.error || xhr.statusText}`, 'danger');
      });
  }

  // If there's an image, convert to base64; otherwise submit without image
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      submitRecipe(event.target.result);
    };
    reader.onerror = () => {
      showStatus('Failed to read image file.', 'danger');
    };
    reader.readAsDataURL(file);
  } else {
    submitRecipe();
  }
});

// ─── DELETE - Remove recipe ───────────────────────────────────────────────────
// When the "Delete" button is clicked, this function confirms the action with the user, sends a DELETE request to remove the recipe, and then reloads the recipes to reflect the change. It also includes error handling to display a message if the request fails.
$('#data-container').on('click', '.deleteBtn', function () {
  const id = $(this).closest('.card').data('id');
  if (!confirm('Are you sure you want to delete this recipe?')) return;

  $.ajax({ url: `/api/recipes/${id}`, method: 'DELETE' })
    .done(() => {
      showStatus('Recipe deleted.');
      loadRecipes();
    })
    .fail(() => showStatus('Failed to delete recipe.', 'danger'));
});

// ─── LIKE - Increment likes for recipe ────────────────────────────────────────
// When the "Like" button is clicked, this function sends a POST request to increment the like count for the specific recipe and updates the like count displayed on the button. It also includes error handling to display a message if the request fails.
// Very Very optional, but whatever.
$('#data-container').on('click', '.likeBtn', function () {
  const id = $(this).closest('.card').data('id');
  const likeCountSpan = $(this).find('.likeCount');

  $.ajax({
    url: `/api/recipes/${id}/like`,
    method: 'POST',
    contentType: 'application/json',
  })
    .done((res) => {
      likeCountSpan.text(res.likes);
      showStatus('Recipe liked!');
    })
    .fail(() => showStatus('Failed to like recipe.', 'danger'));
});

// ─── EDIT - Open modal with current values ────────────────────────────────────
// When the "Edit" button is clicked, this function retrieves the current recipe details from the card, populates the edit form in a modal with those details, and then shows the modal to the user. This allows the user to see the existing values and make changes before saving.

$('#data-container').on('click', '.editBtn', function () {
  const card = $(this).closest('.card');
  const id = card.data('id');
  const title = card.find('.card-title').text();
  const ingredients = card.find('p:nth-child(2)').text().replace('Ingredients: ', '');
  const instructions = card.find('p:nth-child(3)').text().replace('Instructions: ', '');

  $('#editId').val(id);
  $('#editTitle').val(title);
  $('#editIngredients').val(ingredients);
  $('#editInstructions').val(instructions);

  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  editModal.show();
});

// ─── UPDATE - PUT updated recipe ──────────────────────────────────────────────
// When the "Save Changes" button in the edit modal is clicked, this function gathers the updated values from the form, sends a PUT request to update the recipe in the database, and then reloads the recipes to reflect the changes. It also includes error handling to display a message if the request fails.

$('#saveEditBtn').on('click', function () {
  const id = $('#editId').val();
  const updated = {
    title: $('#editTitle').val(),
    ingredients: $('#editIngredients').val(),
    instructions: $('#editInstructions').val(),
  };

  $.ajax({
    url: `/api/recipes/${id}`,
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(updated),
  })
    .done(() => {
      showStatus('Recipe updated!');
      bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
      loadRecipes();
    })
    .fail(() => showStatus('Failed to update recipe.', 'danger'));
});

// ─── Comments - Toggle comments section ───────────────────────────────────────
// When the "View Comments" button is clicked, this function toggles the visibility of the comments section for that recipe. If the comments section is being shown, it also calls the function to load and display the comments for that recipe.

$('#data-container').on('click', '.toggleCommentsBtn', function () {
  const card = $(this).closest('.card');
  const recipeId = card.data('id');
  const commentsSection = card.find('.comments-section');
  
  if (commentsSection.is(':visible')) {
    commentsSection.slideUp();
  } else {
    commentsSection.slideDown();
    loadComments(recipeId, card);
  }
});

// ─── Comments - Add new comment ────────────────────────────────────────────────
// When the "Post Comment" button is clicked, this function gathers the author and text from the input fields, sends a POST request to add the comment to the database, and then reloads the comments to show the new comment. It also includes error handling to display a message if the request fails.

$('#data-container').on('click', '.addCommentBtn', function () {
  const card = $(this).closest('.card');
  const recipeId = card.data('id');
  const author = card.find('.commentAuthor').val().trim();
  const text = card.find('.commentText').val().trim();
  
  if (!author || !text) {
    showStatus('Please fill in your name and comment.', 'warning');
    return;
  }
  
  $.ajax({
    url: `/api/recipes/${recipeId}/comments`,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ author, text }),
  })
    .done(() => {
      showStatus('Comment added!');
      card.find('.commentAuthor').val('');
      card.find('.commentText').val('');
      loadComments(recipeId, card);
    })
    .fail(() => showStatus('Failed to add comment.', 'danger'));
});

// ─── Comments - Delete comment ─────────────────────────────────────────────────'
// When the "Delete" button next to a comment is clicked, this function confirms the action with the user, sends a DELETE request to remove the comment from the database, and then reloads the comments to reflect the change. It also includes error handling to display a message if the request fails.

$('#data-container').on('click', '.deleteCommentBtn', function () {
  const commentId = $(this).data('comment-id');
  const card = $(this).closest('.card');
  const recipeId = card.data('id');
  
  if (!confirm('Are you sure you want to delete this comment?')) return;
  
  $.ajax({
    url: `/api/recipes/${recipeId}/comments/${commentId}`,
    method: 'DELETE'
  })
    .done(() => {
      showStatus('Comment deleted.');
      loadComments(recipeId, card);
    })
    .fail(() => showStatus('Failed to delete comment.', 'danger'));
});



// ─── Init ─────────────────────────────────────────────────────────────────────

$(document).ready(() => loadRecipes());
