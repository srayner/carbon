<?php

namespace Cms\Controller;

abstract class AbstractController
{
    protected $templatePath;
    
    public function __construct($config)
    {
        if (isset($config['template_path'])) {
            $this->templatePath = $config['template_path'];
        }
    }
}
