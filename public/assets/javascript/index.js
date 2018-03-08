$(document).ready(function() {
  // grabbing the article-container div to dump dynamic content
  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);

  // runs once page is ready
  initPage();

  function initPage() {
    // AJAX request for any unsaved articles
    articleContainer.empty();
    $.get("/api/headlines?saved=false").then(function(data) {
      // render any found articles to page
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
    // pass each article JSON object to createPanel() and get back HTML containing article data
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
        "<a class='btn btn-success save'>",
        "Save Article",
        "</a>",
        "</h3>",
        "</div>",
        "<div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>"
      ].join("")
    );
    // attach the article's id to the jQuery element
    // to use when trying to figure out which article the user wants to save
    panel.data("_id", article._id);

    return panel;
  }

  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    // grab headline id we saved in panel data (line 56)
    var articleToSave = $(this)
      .parents(".panel")
      .data();
    articleToSave.saved = true;

    $.ajax({
      method: "PUT",
      url: "/api/headlines/" + articleToSave._id,
      data: articleToSave
    }).then(function(data) {
      // run initPage() if data save successful to reload articles
      if (data.saved) {
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    $.get("/api/fetch").then(function(data) {
      // rerender articles and alert user of how many new articles saved
      initPage();
      bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
    });
  }
});
