<?php

define("DB_DSN", "mysql:host=localhost;dbname=carbon");
define("DB_USERNAME", "carbon");
define("DB_PASSWORD", "password" );
define("TEMPLATE_PATH", __DIR__ . "/../src/cms/View/templates");
define("HOMEPAGE_NUM_ARTICLES", 5);
define("ADMIN_USERNAME", "admin");
define("ADMIN_PASSWORD", "mypass");

$params = [
    'acl' => include __DIR__ . '/acl.php',
    'controllers' => [
        'index'    => 'Cms\Controller\IndexController',
        'auth'     => 'Cms\Controller\AdminController',
        'article'  => 'Cms\Controller\AdminController',
        'category' => 'Cms\Controller\CategoryController'
    ],
    'routes' => [
        'home' => [
            'pattern'    => '/',
            'controller' => 'index',
            'action'     => 'index',
        ],
        'archive' => [
            'pattern'    => '/archive',
            'controller' => 'index',
            'action'     => 'archive',
        ],
        'article' => [
            'pattern'    => '/article',
            'controller' => 'index',
            'action'     => 'article',
        ],
        'login' => [
            'pattern'    => '/login',
            'controller' => 'auth',
            'action'     => 'login',
        ],
        'logout' => [
            'pattern'    => '/logout',
            'controller' => 'auth',
            'action'     => 'logout',
        ],
        'overview' => [
            'pattern'    => '/overview',
            'controller' => 'auth',
            'action'     => 'overview',
        ],
        'article_index' => [
            'pattern'    => '/articles',
            'controller' => 'article',
            'action'     => 'index',
        ],
        'article_add' => [
            'pattern'    => '/articles/add',
            'controller' => 'article',
            'action'     => 'add',
        ],
        'article_edit' => [
            'pattern'    => '/articles/edit',
            'controller' => 'article',
            'action'     => 'edit',
        ],
        'article_delete' => [
            'pattern'    => '/articles/delete',
            'controller' => 'article',
            'action'     => 'delete',
        ],
        'category_index' => [
            'pattern'    => '/categories',
            'controller' => 'category',
            'action'     => 'index',
        ],
        'category_add' => [
            'pattern'    => '/categories/add',
            'controller' => 'category',
            'action'     => 'add',
        ],
        'category_edit' => [
            'pattern'    => '/categories/edit',
            'controller' => 'category',
            'action'     => 'edit',
        ],
        'category_delete' => [
            'pattern'    => '/categories/delete',
            'controller' => 'category',
            'action'     => 'delete',
        ],
    ],
    'template_path' => TEMPLATE_PATH
];

