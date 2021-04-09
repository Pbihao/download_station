import * as TypeORM from "typeorm";
import Upload_resource from "./upload_resource";

@TypeORM.Entity()
export default class Resource extends TypeORM.BaseEntity{

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Index()
    @TypeORM.Column({nullable: false, type: "varchar", length:80})
    name: string

    @TypeORM.Column({nullable: false, type: "int"})
    size: number

    @TypeORM.Column({ nullable: true, type: "varchar", length: 120 })
    content: string;

    @TypeORM.Column({ nullable: true, type: "varchar", length: 1000 })
    location: string;

    @TypeORM.Column({nullable: false, default: 0})
    download_times: number

    @TypeORM.OneToOne(type => Upload_resource)
    @TypeORM.JoinColumn()
    upload_resource: Upload_resource
}
