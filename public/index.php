<?php

use Acl\Acl;
use Router\Router;

// Configuration
require(__DIR__ . "/../config/config.php");
ini_set( "display_errors", true );
date_default_timezone_set("Europe/London");
session_start();

// Require the autoloader
require(__DIR__ . "/../autoload.php");

$acl = new Acl($params['acl']);
$role = isset($_SESSION['username']) ? $_SESSION['username'] : 'guest';

// Route the request.
$router = new Router($params);
$route = $router->route();
if ($route) {
    $controller = $route['controller'];
    $action = $route['action'];
    if ($acl->isAllowed($role, $controller)) {
        dispatch($controller, $action, $params);
    } else {
        dispatch('auth', 'login', $params);
    }
}
notfound();

function dispatch($controllerName, $actionName, $params)
{
    if (!array_key_exists($controllerName, $params['controllers'])) {
        return;
    }
    $controller = new $params['controllers'][$controllerName]($params);
    $controller->{$actionName . 'Action'}();
    exit;
}

function notFound()
{
    http_response_code(404);
    exit;
}
