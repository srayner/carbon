<?php

$class_map = [
    'Cms\\'    => '/src/cms/',
    'Router\\' => '/src/router/',
];

spl_autoload_register(function ($class) use ($class_map) {
    foreach ($class_map as $prefix => $base_dir) {
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) === 0) {
            $relative_class = substr($class, $len);
            $file = __DIR__ . $base_dir . str_replace('\\', '/', $relative_class) . '.php';
            if (file_exists($file)) {
                require $file;
            }
            break;
        }
    }
});
