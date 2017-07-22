<?php

define("DB_DSN", "mysql:host=localhost;dbname=carbon");
define("DB_USERNAME", "carbon");
define("DB_PASSWORD", "password" );
define("TEMPLATE_PATH", __DIR__ . "/../src/cms/View/templates");
define("HOMEPAGE_NUM_ARTICLES", 5);
define("ADMIN_USERNAME", "admin");
define("ADMIN_PASSWORD", "mypass");

$params = [
    'routes' => [
        'home' => [
            'pattern'    => '/',
            'controller' => 'Cms\Controller\IndexController',
            'action'     => 'index',
        ],
        'archive' => [
            'pattern'    => '/archive',
            'controller' => 'Cms\Controller\IndexController',
            'action'     => 'archive',
        ],
        'article' => [
            'pattern'    => '/article',
            'controller' => 'Cms\Controller\IndexController',
            'action'     => 'article',
        ],
        'login' => [
            'pattern'    => '/login',
            'controller' => 'Cms\Controller\AdminController',
            'action'     => 'login',
        ],
        'logout' => [
            'pattern'    => '/logout',
            'controller' => 'Cms\Controller\AdminController',
            'action'     => 'logout',
        ],
        'admin' => [
            'pattern'    => '/admin',
            'controller' => 'Cms\Controller\AdminController',
            'action'     => 'index',
        ],
        'add' => [
            'pattern'    => '/add',
            'controller' => 'Cms\Controller\AdminController',
            'action'     => 'add',
        ],
        'edit' => [
            'pattern'    => '/edit',
            'controller' => 'Cms\Controller\AdminController',
            'action'     => 'edit',
        ],
        'delete' => [
            'pattern'    => '/delete',
            'controller' => 'Cms\Controller\AdminController',
            'action'     => 'delete',
        ],
    ],
    'template_path' => TEMPLATE_PATH
];

