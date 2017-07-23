<?php include __DIR__ . "/include/header.php" ?>

    <div class="row">
        <div class="col-sm-12">
            
            <h1>Article Archive</h1>
            <ul class="list-unstyled">

                <?php foreach ($results['articles'] as $article): ?>
                        <li>
                            <a href="/article?articleId=<?php echo $article->id?>">
                            <h2 class="list-group-item-heading"><?php echo htmlspecialchars( $article->title )?></h2>
                            </a>
                            <small class="pubDate"><?php echo date('j F', $article->publicationDate)?></small>
                            <p class="list-group-item-text"><?php echo htmlspecialchars( $article->summary )?></p>
                        </li>
                        <hr>
                <?php endforeach; ?>

            </ul>

            <p><?php echo $results['totalRows']?> article<?php echo ( $results['totalRows'] != 1 ) ? 's' : '' ?> in total.</p>

            <p><a href="/">Return to Homepage</a></p>
        </div>
    </div>
        
<?php include __DIR__ . "/include/footer.php" ?>
