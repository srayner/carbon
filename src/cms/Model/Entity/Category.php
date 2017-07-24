<?php

namespace Cms\Model\Entity;

use PDO;

/**
 * Class to handle articles
 */
class Category
{
    /** @var int The category ID from the database */
    public $id = null;
 
    /** @var string The title of the category */
    public $title = null;
 
    /** @var boolean Flag to indicate category should be included in the site menu */
    public $showInMenu = null;
 
    /**
     * Sets the object's properties using the values in the supplied array
     * 
     * @param assoc The property values
     */
    public function __construct($data = array())
    {
        if (isset($data['id'])) {
            $this->id = (int) $data['id'];
        }
        if (isset($data['title'])) {
            $this->title = preg_replace ( "/[^\.\,\-\_\'\"\@\?\!\:\$ a-zA-Z0-9()]/", "", $data['title']);
        }
        if (isset($data['showInMenu'])) {
            $this->summary = (bool) $data['showInMenu'];
        }
    }
 
 
    /**
     * Sets the object's properties using the edit form post values in the supplied array
     *
     * @param assoc The form post values
     */
    public function storeFormValues ($params)
    {
 
        // Store all the parameters
        $this->__construct($params);
    }
  
    /**
     * Returns a Category object matching the given category ID
     *
     * @param int The category ID
     * @return Category|false The category object, or false if the record was not found or there was a problem
     */
    public static function getById($id)
    {
        $conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
        $sql = "SELECT * FROM category WHERE id = :id";
        $st = $conn->prepare($sql);
        $st->bindValue(":id", $id, PDO::PARAM_INT);
        $st->execute();
        $row = $st->fetch();
        $conn = null;
        if ($row) {
            return new Category($row);
        }
    }
 
    /**
     * Returns all Category objects in the DB
     *
     * @return Array|false A two-element array : results => array, a list of Category objects; totalRows => Total number of categories
     */
    public static function getList()
    {   
        $conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
        $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM category";

        $st = $conn->prepare($sql);
        $st->execute();
        $list = array();
 
        while ( $row = $st->fetch() ) {
            $category = new Category($row);
            $list[] = $category;
        }
 
        // Now get the total number of articles that matched the criteria
        $sql = "SELECT FOUND_ROWS() AS totalRows";
        $totalRows = $conn->query($sql)->fetch();
        $conn = null;
        return (array("results" => $list, "totalRows" => $totalRows[0]));
    }
 
 
    /**
     * Inserts the current Category object into the database, and sets its ID property.
     */ 
    public function insert()
    {
        // Does the Category object already have an ID?
        if (!is_null( $this->id)) {
            trigger_error ("Category::insert(): Attempt to insert a Category object that already has its ID property set (to $this->id).", E_USER_ERROR );
        }
    
        // Insert the Category
        $conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
        $sql = "INSERT INTO category (title, showInMenu) VALUES (:title, :showInMenu)";
        $st = $conn->prepare ($sql);
        $st->bindValue(":title", $this->title, PDO::PARAM_STR);
        $st->bindValue(":showInMenu", $this->showInMenu, PDO::PARAM_INT);
        $st->execute();
        $this->id = $conn->lastInsertId();
        $conn = null;
    }
 
    /**
     * Updates the current Category object in the database.
     */ 
    public function update()
    {
        // Does the Category object have an ID?
        if (is_null($this->id)) {
            trigger_error ("Category::update(): Attempt to update an Category object that does not have its ID property set.", E_USER_ERROR);
        }
    
        // Update the Category
        $conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
        $sql = "UPDATE category SET title=:title, showInMenu=:showInMenu WHERE id = :id";
        $st = $conn->prepare ( $sql );
        $st->bindValue(":title", $this->title, PDO::PARAM_STR);
        $st->bindValue(":showInMenu", $this->showInMenu, PDO::PARAM_STR);
        $st->bindValue(":id", $this->id, PDO::PARAM_INT);
        $st->execute();
        $conn = null;
    }
 
    /**
     * Deletes the current Category object from the database.
     */
    public function delete()
    {
        // Does the Category object have an ID?
        if (is_null($this->id)) {
            trigger_error ( "Category::delete(): Attempt to delete a Category object that does not have its ID property set.", E_USER_ERROR);
        }
 
        // Delete the Category
        $conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
        $st = $conn->prepare ("DELETE FROM category WHERE id = :id LIMIT 1");
        $st->bindValue(":id", $this->id, PDO::PARAM_INT);
        $st->execute();
        $conn = null;
    }
    
    /**
     * Counts the number of categories in the database
     * 
     * @return integer The number of categories in the database
     */
    public static function count()
    {
        $conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
        $st = $conn->prepare("select count(*) from category");
        $st->execute();
        $row = $st->fetchColumn();
        return (int)$row;
    }
}