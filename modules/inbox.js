let TypeORM = require('typeorm')
let Message = station.model("message")
let Send = station.model("send")
let Receive = station.model("receive")

app.get('/inbox', async (req, res) => {
    try {

        let messages = await TypeORM.createQueryBuilder(Message, "mes")
            .select(['mes', 'rec', 'user'])
            .innerJoin("mes.receive", 'rec')
            .innerJoin('rec.user', 'user')
            .where("user.user_number = :number", {number: res.locals.user.user_number})
            .getMany()

        messages = messages.reverse()

        res.render("inbox", {
            messages: messages
        })
    } catch (e) {
        station.log(e);
        res.status(404);
        res.render('error', {
            err: e
        });
    }
});


app.get('/inbox/watch/:id', async (req, res) => {
    try {

        let message = await TypeORM.createQueryBuilder(Message, "mes")
            .select(['mes', 'sd', 'user'])
            .leftJoin("mes.send", 'sd')
            .leftJoin('sd.user', 'user')
            .where("mes.id = :id", {id: req.params.id})
            .getOne()

        res.render("message_watch", {
            message: message
        })
    } catch (e) {
        station.log(e);
        res.status(404);
        res.render('error', {
            err: e
        });
    }
});