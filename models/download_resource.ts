import * as TypeORM from "typeorm";
import User from "./user";
import Resource from "./resource";

@TypeORM.Entity()
export default class Download_resource extends TypeORM.BaseEntity{
    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.ManyToOne(() => User)
    user: User;

    @TypeORM.ManyToOne(() => Resource)
    resource: Resource

    @TypeORM.Column({type: "varchar", length: 20, nullable: true})
    download_date: string
}