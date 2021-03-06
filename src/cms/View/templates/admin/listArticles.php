<?php include __DIR__ . "/../include/header.php" ?>
 
    <div class="row">
        <div class="col-sm-12">
            
            <h1>Site Admin</h1>
                    
            <div class="panel panel-default">
                <div class="panel-body">
                    <ul class="nav nav-pills">
                        <li role="presentation"><a href="/overview">Overview</a></li>
                        <li role="presentation" class="active"><a href="#">Articles</a></li>
                        <li role="presentation"><a href="/categories">Categories</a></li>
                    </ul>
                
                
            
            

            <?php if ( isset( $results['errorMessage'] ) ) { ?>
                <div class="alert alert-danger"><?php echo $results['errorMessage'] ?></div>
            <?php } ?>


            <?php if ( isset( $results['statusMessage'] ) ) { ?>
                    <div class="alert alert-success"><?php echo $results['statusMessage'] ?></div>
            <?php } ?>

            <div class="pull-right"><a href="/articles/add">Add a New Article</a></div>

            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Publication Date</th>
                        <th>Article</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($results['articles'] as $article): ?>
                    <tr onclick="location='/articles/edit?articleId=<?php echo $article->id?>'">
                        <td><?php echo date('j M Y', $article->publicationDate)?></td>
                        <td><?php echo $article->title?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>

            <p><?php echo $results['totalRows']?> article<?php echo ( $results['totalRows'] != 1 ) ? 's' : '' ?> in total.</p>
        
            </div></div>
            
        </div>
    </div>

<?php include __DIR__ . "/../include/footer.php" ?>
