<?php

ini_set( "display_errors", true );
date_default_timezone_set( "Europe/London" );  // http://www.php.net/manual/en/timezones.php
define( "DB_DSN", "mysql:host=localhost;dbname=carbon" );
define( "DB_USERNAME", "carbon" );
define( "DB_PASSWORD", "password" );
define( "CLASS_PATH", "classes" );
define( "TEMPLATE_PATH", "templates" );
define( "HOMEPAGE_NUM_ARTICLES", 5 );
define( "ADMIN_USERNAME", "admin" );
define( "ADMIN_PASSWORD", "mypass" );
require( CLASS_PATH . "/Article.php" );
 
function handleException( $exception ) {
    echo "Sorry, a problem occurred. Please try later.";
    error_log( $exception->getMessage() );
}
 
//set_exception_handler( 'handleException' );
