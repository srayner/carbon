<?php include __DIR__ . "/include/header.php" ?>

    <div class="row">
                
        <h1>Latest Articles</h1>
        <ul class="list-unstyled">

            <?php foreach ($results['articles'] as $article): ?>
                    <li>
                        <a href="/article?articleId=<?php echo $article->id?>">
                        <h2 class="list-group-item-heading"><?php echo htmlspecialchars( $article->title )?></h2>
                        </a>
                        <small class="pubDate">
                            <span class="glyphicon glyphicon-calendar"></span>
                            <?php echo date('jS F, Y', $article->publicationDate)?>
                        </small>
                        <p class="list-group-item-text"><?php echo htmlspecialchars( $article->summary )?></p>
                    </li>
                    <hr>
            <?php endforeach; ?>
                               
        </ul>
        
        <p><a href="/archive">Article Archive</a></p>
        
    </div>
        
<?php include __DIR__ . "/include/footer.php" ?>

