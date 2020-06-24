import { FindConditions, Repository } from 'typeorm';
import lodash from 'lodash';

export class BaseRepository<T> extends Repository<T> {
  public async findOneBy(params: FindConditions<any>): Promise<any> {
    const result: any = await this.find(params);

    return result.length > 0 ? result[0] : null;
  }

  public createFromData(data: any): any {
    const item: T = this.create();
    const keys: string[] = Object.keys(data);

    keys.forEach((key: string) => {
      // @ts-ignore
      item[key] = data[key];
    });

    return item;
  }

  protected canUpdateItem(object: any, data: any): boolean {
    const keys: string[] = Object.keys(data);
    let canUpdate = false;

    keys.forEach((key: string) => {
      const oldItem: any = object[key];
      const newItem: any = data[key];

      if (!canUpdate && Array.isArray(oldItem)) {
        if (oldItem.length !== newItem.length) {
          canUpdate = true;
        } else {
          oldItem.forEach((oi: any, index: number) => {
            if (oi !== newItem[index]) {
              canUpdate = true;
            }
          });
        }
      } else if (!canUpdate && lodash.isObject(oldItem)) {
        if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          canUpdate = true;
        }
      } else if (oldItem !== newItem) {
        canUpdate = true;
      }
    });

    return canUpdate;
  }

  public async add(data: any): Promise<T> {
    try {
      return  await this.manager.save(this.createFromData(data));
    } catch (e) {
      throw new Error(e);
    }
  }

  public async change(id: number, data: any): Promise<T|undefined|null> {
    try {
      const item: T|undefined = await this.findOne(id);

      if (!item) {
        return null;
      }

      if (!this.canUpdateItem(item, data)) {
        return null;
      }

      await this.update(id, data);

      return await this.findOne(id);
    } catch (e) {
      throw new Error(e);
    }
  }

  public async suppress(ids: number[]): Promise<void> {
    try {
      for (const id of ids) {
        const item: T|undefined = await this.findOne(id);

        if (item) {
          await this.softDelete(id);
        }
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}
