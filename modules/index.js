const download_station_path = station.utils.resolvePath(station.config.upload_dir, 'downloadStation')
const fs = require('fs-extra')
const path = require('path')
const User = station.model("user")
const Upload_resource = station.model("upload_resource")
const Resource = station.model("resource")
const Download_resource = station.model("download_resource")
const TypeORM = require("typeorm")


app.get('/', async (req, res) => {
    try {
        let filenameList = await fs.readdir(download_station_path)
        let list = await Promise.all(filenameList.map(async x => {
            let stat = await fs.stat(path.join(download_station_path, x))
            if (!stat.isFile()) return undefined

            let resource = await  TypeORM.getManager()
                .createQueryBuilder(Resource, 'resource')
                .select(["resource", "upload", "user"])
                .innerJoin("resource.upload_resource","upload", "resource.uploadResourceId = upload.id")
                .innerJoin("upload.user", 'user', 'user.id = upload.userId')
                .where("resource.name=:name", {name: x})
                .getOne()


            return {
                filename: x,
                size: stat.size,
                download_times:resource.download_times,
                send_name: resource.upload_resource.user.name
            }
        }))

        list = list.filter(x => x)


        res.render("index", {
            filedata: list
        })
    } catch (e) {
        station.log(e);
        res.status(404);
        res.render('error', {
            err: e
        });
    }
});



app.get('/download/download/:filename', async (req, res) => {
    try {
        if (typeof req.params.filename === 'string' && (req.params.filename.includes('../'))) throw new ErrorMessage('您没有权限进行此操作。)');

        let file_path = path.join(download_station_path, req.params.filename)
        if (! await station.utils.isFile(file_path))throw new ErrorMessage('文件不存在...')
        let sendName = path.basename(file_path)

        let user = res.locals.user
        if(!user)throw ErrorMessage("请先登录！");
        let resource = await Resource.findOne({
            where: {
                name: sendName
            }
        })
        resource.download_times = resource.download_times + 1
        await resource.save()

        await resource.save();
        let now = new Date().getTime();
        now = now.toString()
        let download_resource = await Download_resource.create({
            user: user,
            resource: resource,
            download_date: now
        })
        await download_resource.save()

        res.download(file_path, sendName);

    } catch (e) {
        station.log(e);
        res.status(404);
        res.render('error', {
            err: e
        });
    }
})

app.post('/download/upload', app.multer.array('file'), async (req, res) => {
    try {
        let user = res.locals.user

        if (!user)throw ErrorMessage("请先登录！")

        await fs.ensureDir(download_station_path)
        if (req.files) {
            for (let file of req.files) {
                let new_path = path.join(download_station_path, file.originalname)
                await fs.move(file.path, new_path, {
                    overwrite: true
                })

                let now = new Date().getTime();
                now = now.toString()
                let upload = await Upload_resource.create({
                    user: user,
                    upload_date: now
                })
                await upload.save();

                let resource = await Resource.findOne({where: {
                    name: file.originalname
                    }})
                if(resource){
                    await resource.remove()
                }

                resource = await Resource.create({
                    name: file.originalname,
                    size: file.size,
                    content: file.originalname,
                    location: new_path,
                    download_times: 0,
                    upload_resource: upload
                })
                await resource.save();
            }
        }

        res.redirect("back");
    } catch (e) {
        station.log(e)
        res.render('error', {
            err: e
        })
    }
})

