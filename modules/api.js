let User = station.model("user")
let Identity = station.model("identity")

app.post('/api/signup', async (req, res) => {
    try {

        res.setHeader('Content-Type', 'application/json');
        let user = await User.fromNumber(req.body.user_number);
        if (user) throw 2008;

        let identity = await Identity.fromIdentity(req.body.identity);
        if(!identity){
            identity = await Identity.create({
                identity: req.body.identity
            })
            await identity.save()
        }

        user = await User.create({
            user_number: req.body.user_number,
            password: req.body.password,
            name: req.body.name,
            sex: req.body.sex,
            identity: identity
        });
        await user.save();

        res.cookie('login', JSON.stringify([req.body.user_number, req.body.password,]), { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

        res.send(JSON.stringify({ error_code: 1 }));
    } catch (e) {
        station.log(e);
        res.send(JSON.stringify({ error_code: e }));
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        let user = await User.fromNumber(req.body.user_number);

        if (!user) throw 1001;
        else if (user.password == null || user.password === '') res.send({ error_code: 1003 });
        else if (user.password !== req.body.password) res.send({ error_code: 1002 });
        else {
            res.cookie('login', JSON.stringify([req.body.user_number, req.body.password,]), { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
            res.send({ error_code: 1 });
        }
    } catch (e) {
        syzoj.log(e);
        res.send({ error_code: e });
    }
});

// Logout
app.post('/logout', async (req, res) => {
    res.clearCookie('login');
    res.redirect(req.query.url || '/');
});