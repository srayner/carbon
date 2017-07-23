<?php

namespace Cms\Controller;

use Cms\Model\Entity\Article;

class AdminController extends AbstractController
{   
    public function indexAction()
    {   
        $results = array();
        $data = Article::getList();
        $results['articles'] = $data['results'];
        $results['totalRows'] = $data['totalRows'];
        $results['pageTitle'] = "All Articles";

        if (isset($_GET['error'])) {
            if ($_GET['error'] == "articleNotFound")
                $results['errorMessage'] = "Error: Article not found.";
        }

        if (isset($_GET['status'])) {
            if ($_GET['status'] == "changesSaved")
                $results['statusMessage'] = "Your changes have been saved.";
            if ($_GET['status'] == "articleDeleted")
                $results['statusMessage'] = "Article deleted.";
        }

        require($this->templatePath . "/admin/listArticles.php");
    }

    public function loginAction()
    {
        $results = array();
        $results['pageTitle'] = "Admin Login | Widget News";

        if (isset($_POST['login'])) {

            // User has posted the login form: attempt to log the user in
            if ($_POST['username'] == ADMIN_USERNAME && $_POST['password'] == ADMIN_PASSWORD) {
                // Login successful: Create a session and redirect to the admin homepage
                $_SESSION['username'] = ADMIN_USERNAME;
                header("Location: /articles");
            } else {
                // Login failed: display an error message to the user
                $results['errorMessage'] = "Incorrect username or password.";
                require($this->templatePath . "/admin/loginForm.php");
            }
        } else {
            // User has not posted the login form yet: display the form
            require($this->templatePath . "/admin/loginForm.php");
        }
    }

    public function logoutAction()
    {
        unset($_SESSION['username']);
        header("Location: /");
    }
    
    public function addAction()
    {
        $results = array();
        $results['pageTitle'] = "New Article";
        $results['formAction'] = "/articles/add";

        if (isset($_POST['saveChanges'])) {
            // User has posted the article edit form: save the new article
            $article = new Article;
            $article->storeFormValues($_POST);
            $article->insert();
            header("Location: /articles?status=changesSaved");
        } elseif (isset($_POST['cancel'])) {
            // User has cancelled their edits: return to the article list
            header("Location: /articles");
        } else {
            // User has not posted the article edit form yet: display the form
            $results['article'] = new Article;
            require($this->templatePath . "/admin/editArticle.php");
        }
    }

    public function editAction()
    {   
        $results = array();
        $results['pageTitle'] = "Edit Article";
        $results['formAction'] = "/articles/edit";

        if (isset($_POST['saveChanges'])) {
            // User has posted the article edit form: save the article changes
            if (!$article = Article::getById((int) $_POST['articleId'])) {
                header("Location: /articles?error=articleNotFound");
                return;
            }
            $article->storeFormValues($_POST);
            $article->update();
            header("Location: /articles?status=changesSaved");
        } elseif (isset($_POST['cancel'])) {
            // User has cancelled their edits: return to the article list
            header("Location: /articles");
        } else {
            // User has not posted the article edit form yet: display the form
            $results['article'] = Article::getById((int) $_GET['articleId']);
            require($this->templatePath . "/admin/editArticle.php");
        }
    }

    public function deleteAction()
    {
        if (!$article = Article::getById( (int)$_GET['articleId'])) {
            header("Location: /admin?error=articleNotFound");
            return;
        }
 
        $article->delete();
        header("Location: /articles?status=articleDeleted");
    }
}


