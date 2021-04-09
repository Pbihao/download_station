import * as TypeORM from "typeorm";
import User from "./user";
import Resource from "./resource";

@TypeORM.Entity()
export default class Upload_resource extends TypeORM.BaseEntity{
    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({type: "varchar", length: 20, nullable: true})
    upload_date: string;

    @TypeORM.ManyToOne(type => User)
    user: User;
}