<?php include __DIR__ . "/../include/header.php" ?>
 
            <div class="row">
                <div class="col-lg-4 col-lg-offset-4 col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-10 col-xs-offset-1">
                    <div class="login-form well text-center">
                        
                        <form action="/login" method="post">
                            <input type="hidden" name="login" value="true" />

                            <?php if (isset( $results['errorMessage'])): ?>
                            <div class="alert alert-danger"><?php echo $results['errorMessage'] ?></div>
                            <?php endif; ?>

                            <div class="form-group">
                                <label for="username">Username</label>
                                <div class="input-group">
                                    <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                                    <input type="text" name="username" id="username" class="form-control" placeholder="Your admin username" required autofocus maxlength="20" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <div class="input-group">
                                    <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                                    <input type="password" name="password" id="password" class="form-control" placeholder="Your admin password" required maxlength="20" />
                                </div>
                            </div>                
                            <input type="submit" name="login" class="form-control btn btn-primary" value="Login" />
                        </form>
                        

                    </div>
                </div>
            </div>


 
<?php include __DIR__ . "/../include/footer.php" ?>