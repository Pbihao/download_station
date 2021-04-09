import * as TypeORM from "typeorm";
import Receive from "./receive";
import Send from "./send";

@TypeORM.Entity()
export default class Message extends TypeORM.BaseEntity{

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({nullable: false, type: "varchar", length:80})
    title: string

    @TypeORM.Column({nullable: false, type: "varchar", length:1000})
    content: string

    @TypeORM.OneToOne(()=>Send)
    @TypeORM.JoinColumn()
    send: Send

    @TypeORM.OneToOne(() => Receive)
    @TypeORM.JoinColumn()
    receive: Receive
}