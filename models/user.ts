import * as TypeORM from "typeorm";
import Identity from "./identity";

@TypeORM.Entity()
export default class User extends TypeORM.BaseEntity{

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Index({unique: true })
    @TypeORM.Column({nullable: false, type: "varchar", length:80})
    user_number: string

    @TypeORM.Column({nullable: false, type: "varchar", length:80})
    name: string

    @TypeORM.Column({ nullable: true, type: "varchar", length: 120 })
    password: string;

    @TypeORM.Column({ nullable: true, type: "varchar", length: 10 })
    sex: string;

    @TypeORM.Column({ nullable: true, type: "integer"})
    isadmin: number;

    @TypeORM.ManyToOne(type => Identity)
    identity: Identity;

    static async fromNumber(number): Promise<User> {
        return User.findOne({
            where: {
                user_number: number
            }
        })
    }
}