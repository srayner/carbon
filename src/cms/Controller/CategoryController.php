<?php

namespace Cms\Controller;

use Cms\Model\Entity\Category;

class CategoryController extends AbstractController
{
    
    
    public function indexAction()
    {
        $results = array();
        $data = Category::getList();
        $results['categories'] = $data['results'];
        $results['totalRows'] = $data['totalRows'];
        $results['pageTitle'] = "All Categories";

        if (isset($_GET['error'])) {
            if ($_GET['error'] == "categoryNotFound")
                $results['errorMessage'] = "Error: Category not found.";
        }

        if (isset($_GET['status'])) {
            if ($_GET['status'] == "changesSaved")
                $results['statusMessage'] = "Your changes have been saved.";
            if ($_GET['status'] == "categoryDeleted")
                $results['statusMessage'] = "Category deleted.";
        }

        require($this->templatePath . "/admin/listCategories.php");
        
    }

    public function editAction()
    {
        
    }

    public function deleteAction()
    {
    }
}


