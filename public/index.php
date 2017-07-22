<?php

use Router\Router;

// Configuration
require(__DIR__ . "/../config/config.php");
ini_set( "display_errors", true );
date_default_timezone_set("Europe/London");
session_start();

// Require the autoloader
require(__DIR__ . "/../autoload.php");

// Route the request.
$router = new Router($params);
$route = $router->route();
if ($route) {
    $controller = new $route['controller']($params);
    $action = $route['action'] . 'Action';
    $controller->$action();
} else {
    http_response_code(404);
}
