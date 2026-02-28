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

function renderData(recipes) {
  const container = $('#data-container');
  container.empty();

  if (!recipes.length) {
    container.append('<p class="text-muted">No recipes yet — add one above!</p>');
    return;
  }

  recipes.forEach(entry => {
    // Create image HTML if recipe has an image
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
              <div class="d-flex gap-2 align-items-center flex-wrap">
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

// ─── CREATE - POST new recipe with optional image ────────────────────────────

$('#dataForm').on('submit', function (e) {
  e.preventDefault();
  const form = this;
  const imageInput = document.getElementById('entryImage');
  const file = imageInput?.files[0];

  // Function to submit recipe (with or without image)
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
      showStatus('Recipe deleted.');
      loadRecipes();
    })
    .fail(() => showStatus('Failed to delete recipe.', 'danger'));
});

// ─── EDIT - Open modal with current values ────────────────────────────────────

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

// ─── Comments - Delete comment ─────────────────────────────────────────────────

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
