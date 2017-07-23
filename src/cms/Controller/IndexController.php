<?php

namespace Cms\Controller;

use Cms\Model\Entity\Article;

class IndexController extends AbstractController
{
    public function archiveAction()
    {
        $results = array();
        $data = Article::getList();
        $results['articles'] = $data['results'];
        $results['totalRows'] = $data['totalRows'];
        $results['pageTitle'] = "Article Archive | Carbon CMS";
        require($this->templatePath . "/archive.php" );
    }
    
    public function indexAction()
    {
        $results = array();
        $data = Article::getList(HOMEPAGE_NUM_ARTICLES);
        $results['articles'] = $data['results'];
        $results['totalRows'] = $data['totalRows'];
        $results['pageTitle'] = "Carbon CMS";
        require($this->templatePath . "/homepage.php");
    }
    
    public function articleAction()
    {
        if (!isset($_GET["articleId"]) || !$_GET["articleId"]) {
            $this->indexAction();
            return;
        }

        $article = Article::getById((int)$_GET["articleId"]);
        if ($article) {
            $results = [];
            $results['article'] = $article;
            $results['pageTitle'] = $results['article']->title . " | Carbon CMS";
            require($this->templatePath . "/viewArticle.php");
            return;
        }
        http_response_code(404);
    }
}
