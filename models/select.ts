import * as TypeORM from "typeorm";
import Receive from "./receive";
import Send from "./send";
import User from "./user";
import Course from "./course";

@TypeORM.Entity()
export default class Select extends TypeORM.BaseEntity{

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.ManyToOne(()=>User)
    student: User

    @TypeORM.ManyToOne(()=>Course)
    course: Course
}