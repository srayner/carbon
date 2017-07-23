<?php

namespace Acl;

class Acl
{
    protected $acl;
    
    public function __construct(array $acl)
    {
        $this->acl = $acl;
    }
    
    public function isAllowed($role, $resource)
    {
        if (!array_key_exists($resource, $this->acl)) {
            return false;
        }
        
        return in_array($role, $this->acl[$resource]);
    }
}
