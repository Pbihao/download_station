import * as TypeORM from "typeorm";
import User from "./user";


@TypeORM.Entity()
export default class Send extends TypeORM.BaseEntity{

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({nullable: false, type: "varchar", length:80})
    date: string

    @TypeORM.ManyToOne(()=>User)
    user:User
}