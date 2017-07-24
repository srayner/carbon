<?php include __DIR__ . "/../include/header.php" ?>
 
    <div class="row">
        <div class="col-sm-12">
            
            <h1>Site Admin</h1>
            
            <div class="panel panel-default">
                <div class="panel-body">
                    <ul class="nav nav-pills">
                        <li role="presentation" class="active"><a href="#">Overview</a></li>
                        <li role="presentation"><a href="/articles">Articles</a></li>
                        <li role="presentation"><a href="/categories">Categories</a></li>
                    </ul>
                
                
            <div class="panel panel-default">
                <div class="panel-body">
                    <h3><span class="glyphicon glyphicon-stats" aria-hidden="true"></span> Articles</h3>
                    <span><?php echo $results['articles'] ?></span>
                    
                </div>
            </div>
            

            <div class="panel panel-default">
                <div class="panel-body">
                    <h3><span class="glyphicon glyphicon-stats" aria-hidden="true"></span> Categories</h3>
                    <span><?php echo $results['categories'] ?></span>
                    
                </div>
            </div>
            

            
        
            </div></div>
            
        </div>
    </div>

<?php include __DIR__ . "/../include/footer.php" ?>
