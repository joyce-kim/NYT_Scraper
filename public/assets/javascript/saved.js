$(document).ready(function() {

  var articleContainer = $(".article-container");

  $(document).on("click", ".btn.delete", handleArticleDelete);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  initPage();

  function initPage() {
    // AJAX request for any saved articles
    articleContainer.empty();
    $.get("/api/headlines?saved=true").then(function(data) {
      // render any found articles to the page
      if (data && data.length) {
        renderArticles(data);
      }
      else {
        // else, render a message explaining we have no articles
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    var articlePanels = [];
    // pass each article JSON object to createPanel() and get back HTML with article data
    for (var i = 0; i < articles.length; i++) {
      articlePanels.push(createPanel(articles[i]));
    }
    articleContainer.append(articlePanels);
  }

  function createPanel(article) {
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h3>",
        "<a class='article-link' target='_blank' href='" + article.url + "'>",
        article.headline,
        "</a>",
        "<a class='btn btn-danger delete'>",
        "Delete From Saved",
        "</a>",
        "<a class='btn btn-info notes'>Article Notes</a>",
        "</h3>",
        "</div>",
        "<div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>"
      ].join("")
    );
    // attach article's id for when the user wants to remove or open notes
    panel.data("_id", article._id);

    return panel;
  }

  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>Would You Like to Browse Available Articles?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    articleContainer.append(emptyAlert);
  }

  function renderNotesList(data) {

    // array of notes to render after finished
    var notesToRender = [];
    // temporarily store each note
    var currentNote;
    if (!data.notes.length) {
      // if no notes, just display a message explaing this
      currentNote = ["<li class='list-group-item'>", "No notes for this article yet.", "</li>"].join("");
      notesToRender.push(currentNote);
    }
    else {
      // if we do have notes, create li element for each
      for (var i = 0; i < data.notes.length; i++) {
        currentNote = $(
          [
            "<li class='list-group-item note'>",
            data.notes[i].noteText,
            "<button class='btn btn-danger note-delete'>x</button>",
            "</li>"
          ].join("")
        );
        // store the note id for when trying to delete
        currentNote.children("button").data("_id", data.notes[i]._id);
        // add currentNote to the notesToRender array
        notesToRender.push(currentNote);
      }
    }
    $(".note-container").append(notesToRender);
  }

  function handleArticleDelete() {
    var articleToDelete = $(this).parents(".panel").data();

    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    }).then(function(data) {
      // if delete successful, rerender list of saved articles via initPage()
      if (data.ok) {
        initPage();
      }
    });
  }

  function handleArticleNotes() {
    // grab article id from panel
    var currentArticle = $(this).parents(".panel").data();
    // get any notes with this id
    $.get("/api/notes/" + currentArticle._id).then(function(data) {

      var modalText = [
        "<div class='container-fluid text-center'>",
        "<h4>Notes For Article: ",
        currentArticle._id,
        "</h4>",
        "<hr />",
        "<ul class='list-group note-container'>",
        "</ul>",
        "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
        "<button class='btn btn-success save'>Save Note</button>",
        "</div>"
      ].join("");
      // add HTML to modal
      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };

      console.log(noteData);
      // attaching note info to grab when adding a new note
      $(".btn.save").data("article", noteData);
      // render the note
      renderNotesList(noteData);
    });
  }

  function handleNoteSave() {
    var noteData;
    var newNote = $(".bootbox-body textarea").val().trim();
    // post note data to "/api/notes" route
    if (newNote) {
      noteData = {
        _id: $(this).data("article")._id,
        noteText: newNote
      };
      $.post("/api/notes", noteData).then(function() {
        // close modal when complete
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    // grab note id to delete
    var noteToDelete = $(this).data("_id");

    $.ajax({
      url: "/api/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function() {
      // when done, hide the modal
      bootbox.hideAll();
    });
  }
});
