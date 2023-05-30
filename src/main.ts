import { NestFactory } from "@nestjs/core";
import { Controller, Module, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository } from "typeorm";

@Entity("orders")
export class OrderEntity {
  constructor(foo: number) {
    this.foo = String(foo);
  }

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column()
  public foo: string;

  @CreateDateColumn()
  public created: Date;

  @OneToMany(() => ItemEntity, items => items.order, { cascade: true })
  public items: ItemEntity[];
}

@Entity("items")
export class ItemEntity {
  constructor(bar: number) {
    this.bar = String(bar);
  }

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column()
  public bar: string;

  @CreateDateColumn()
  public created: Date;

  @ManyToOne(() => OrderEntity, order => order.items)
  public order: OrderEntity;
}

@Controller()
export class AppController implements OnApplicationBootstrap {
  constructor(@InjectRepository(OrderEntity) private orderRepo: Repository<OrderEntity>) {}

  onApplicationBootstrap(): void {
    const newOrders = [...Array(25)]
      .map(foo => {
        const obj = new OrderEntity(foo);
        obj.items = [...Array(2)].map(bar => new ItemEntity(bar));
        return obj;
      });

    // Fill with data
    this.orderRepo
      .save(newOrders)
      .then(res => {
        console.log("Inserted", res);
        this.orderRepo.findAndCount({
          relations: {
            items: true
          },
          order: {
            created: "DESC",
            items: {
              created: "DESC"
            }
          }
        }).then(console.log);
      });
  }
}

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "root",
      password: "testIssue",
      database: "testDb",
      synchronize: true,
      logging: true,
      autoLoadEntities: true
    }),
    TypeOrmModule.forFeature([OrderEntity, ItemEntity])
  ]
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
