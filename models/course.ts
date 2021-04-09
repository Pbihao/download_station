import * as TypeORM from "typeorm";
import Receive from "./receive";
import Send from "./send";
import User from "./user";

@TypeORM.Entity()
export default class Course extends TypeORM.BaseEntity{

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({nullable: false})
    name: string
}