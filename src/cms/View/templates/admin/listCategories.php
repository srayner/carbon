<?php include __DIR__ . "/../include/header.php" ?>
 
    <div class="row">
        <div class="col-sm-12">
            
            <h1>Site Admin</h1>
            
           <div class="panel panel-default">
                <div class="panel-body">
                    
                    <ul class="nav nav-pills">
                        <li role="presentation"><a href="/overview">Overview</a></li>
                        <li role="presentation"><a href="/articles">Articles</a></li>
                        <li role="presentation" class="active"><a href="#">Categories</a></li>
                    </ul>
                
                
            
            

            <?php if ( isset( $results['errorMessage'] ) ) { ?>
                <div class="alert alert-danger"><?php echo $results['errorMessage'] ?></div>
            <?php } ?>


            <?php if ( isset( $results['statusMessage'] ) ) { ?>
                    <div class="alert alert-success"><?php echo $results['statusMessage'] ?></div>
            <?php } ?>

            <div class="pull-right"><a href="/categories/add">Add a New Category</a></div>

            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Show in menu</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($results['categories'] as $category): ?>
                    <tr onclick="location='/categories/edit?categoryId=<?php echo $category->id?>'">
                        <td><?php echo $category->title?></td>
                        <td><?php echo $category->showInMenu ? 'Yes' : 'No' ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>

            <p><?php echo $results['totalRows']?> <?php echo ( $results['totalRows'] == 1 ) ? 'category' : 'categories' ?> in total.</p>
        
                </div>
            </div>
        </div>
    </div>

<?php include __DIR__ . "/../include/footer.php" ?>
