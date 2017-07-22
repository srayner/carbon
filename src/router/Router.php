<?php

namespace Router;

class Router
{
    protected $routes;
    
    public function __construct(array $params)
    {
        if (isset($params['routes'])) {
            $this->routes = $params['routes'];
        }
    }
    
    public function route()
    {
        $requestUrl = $_SERVER['REQUEST_URI'];
        
        // strip GET variables from URL
        if (($pos = strpos($requestUrl, '?')) !== false) {
            $requestUrl = substr($requestUrl, 0, $pos);
        }
        
        foreach ($this->routes as $route)
        {
            if ($route['pattern'] == $requestUrl) {
                return $route;
            }
        }
    }
}