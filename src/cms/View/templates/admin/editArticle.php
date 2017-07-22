<?php include __DIR__ . "/../include/header.php" ?>
 
    <div class="row">
 
        <h1><?php echo $results['pageTitle']?></h1>
 
        <form action="/<?php echo $results['formAction']?>" method="post">
            <input type="hidden" name="articleId" value="<?php echo $results['article']->id ?>"/>
 
            <?php if ( isset( $results['errorMessage'] ) ) { ?>
                <div class="alert alert-danger"><?php echo $results['errorMessage'] ?></div>
            <?php } ?>
 
                <div class="form-group">
                    <label for="title">Article Title</label>
                    <input type="text" name="title" id="title" class="form-control" placeholder="Name of the article" required autofocus maxlength="255" value="<?php echo htmlspecialchars($results['article']->title) ?>" />
                </div>

                <div class="form-group">
                    <label for="summary">Article Summary</label>
                    <textarea name="summary" id="summary" class="form-control" placeholder="Brief description of the article" required maxlength="1000" style="height: 5em;"><?php echo htmlspecialchars($results['article']->summary) ?></textarea>
                </div>

                <div class="form-group">
                    <label for="content">Article Content</label>
                    <textarea name="content" id="content" class="form-control" placeholder="The HTML content of the article" required maxlength="100000" style="height: 30em;"><?php echo htmlspecialchars($results['article']->content) ?></textarea>
                </div>

                <div class="form-group">
                    <label for="publicationDate">Publication Date</label>
                    <input type="date" name="publicationDate" id="publicationDate" class="form-control" placeholder="YYYY-MM-DD" required maxlength="10" value="<?php echo $results['article']->publicationDate ? date("Y-m-d", $results['article']->publicationDate) : "" ?>" />
                </div>
 
                <div class="buttons">
                    <input type="submit" class="btn btn-primary" name="saveChanges" value="Save Changes" />
                    <input type="submit" class="btn btn-default" formnovalidate name="cancel" value="Cancel" />
                </div>
 
        </form>
 
        <?php if ( $results['article']->id ) { ?>
        <br>
        <p><a href="/delete?articleId=<?php echo $results['article']->id ?>" onclick="return confirm('Delete This Article?')">Delete This Article</a></p>
        <?php } ?>
    </div>
<?php include __DIR__ . "/../include/footer.php" ?>