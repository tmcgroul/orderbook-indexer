import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Contract {
  constructor(props?: Partial<Contract>) {
    Object.assign(this, props);
  }

  @PrimaryColumn()
  id!: string;

  @Column("int4", { nullable: false })
  logsCount!: number;

  @Column("int4", { nullable: false })
  foundAt!: number;
}
