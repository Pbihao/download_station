import * as TypeORM from "typeorm";

@TypeORM.Entity()
export default class Identity extends TypeORM.BaseEntity{

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({nullable: false, type: "varchar", length:80})
    identity: string

    static async fromIdentity(identity): Promise<Identity> {
        return Identity.findOne({
            where: {
                identity: identity
            }
        })
    }
}