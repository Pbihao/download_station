let User = station.model('user')

app.get('/login', async (req, res) => {
    try{
        res.render('login')
    } catch (e){
        station.log(e);
        res.render('error', {
            err: e
        });
    }
})

// Sign up
app.get('/signup', async (req, res) => {
    try{
        res.render('signup');
    } catch (e){
        station.log(e);
        res.render('error', {
            err: e
        });
    }
});