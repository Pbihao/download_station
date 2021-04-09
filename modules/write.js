let User = station.model("user")
let Send = station.model("send")
let Receive = station.model("receive")
let Message = station.model("message")

app.get('/write', async (req, res) => {
    try {
        res.render("write", {

        })
    } catch (e) {
        station.log(e);
        res.status(404);
        res.render('error', {
            err: e
        });
    }
});

app.post('/write', async (req, res) => {
    try {
        if (!res.locals.user) throw new ErrorMessage('请登录后继续。');
        if (!req.body.content.trim()) throw new ErrorMessage('内容不能为空.');
        if (!req.body.title.trim()) throw new ErrorMessage('标题不能为空..');
        if (!req.body.receive_number.trim())throw new ErrorMessage('收件人不能为空..');
        let receive_user = await User.findOne({where: {
            user_number: req.body.receive_number.trim()
            }})
        if(!receive_user){
            throw new ErrorMessage('收件人不存在..');
        }
        let date = new Date().getTime().toString();
        let send = await Send.create({
            date: date,
            user:res.locals.user
        })
        await send.save()
        let receive = await Receive.create({
            date: date,
            user:res.locals.user
        })
        await receive.save()
        let message = Message.create({
            title: req.body.title.trim(),
            content: req.body.content.trim(),
            send: send,
            receive: receive
        })
        message.save()

        res.redirect("/write_success")

    } catch (e) {
        station.log(e);
        res.render ('error', {
            err: e
        });
    }
})

app.get('/write_success', async (req, res) => {
    try {
        res.render("write_success");
    } catch (e) {
        station.log(e);
        res.render ('error', {
            err: e
        });
    }
})