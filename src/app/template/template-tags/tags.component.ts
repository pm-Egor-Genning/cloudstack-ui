import { Observable } from 'rxjs/Observable';
import { Tag } from '../../shared/models';
import { TagService } from '../../shared/services/tags/tag.service';
import { TagsComponent } from '../../tags/tags.component';
import { BaseTemplateModel } from '../shared/base-template.model';
import { BaseTemplateService } from '../shared/base-template.service';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '../../dialog/dialog-service/dialog.service';
import { OnInit } from '@angular/core';

export abstract class BaseTemplateTagsComponent extends TagsComponent<BaseTemplateModel> implements OnInit {
  public entity: BaseTemplateModel;

  constructor(
    protected service: BaseTemplateService,
    protected route: ActivatedRoute,
    protected dialogService: DialogService,
    protected tagService: TagService,
  ) {
    super(dialogService, tagService);
  }

  public ngOnInit(): void {
    const params = this.route.snapshot.parent.params;
    this.loadEntity(params.id)
      .subscribe(entity => this.entity = entity);
  }

  protected loadEntity(id: string): Observable<BaseTemplateModel> {
    return this.service.getWithGroupedZones(id)
      .switchMap(template => {
        if (template) {
          return Observable.of(template);
        } else {
          return Observable.throw('ENTITY_DOES_NOT_EXIST');
        }
      })
      .do(template => {
        this.entity = template;

        this.tags$.next(this.entity.tags);

        // todo: remove unsubscribe after migration to ngrx
        this.tags$
          .takeUntil(this.unsubscribe$)
          .subscribe(tags => {
            if (tags) {
              this.entity.tags = tags;
            }
          });
      });
  }

  protected get entityTags(): Observable<Array<Tag>> {
    this.service.invalidateCache();
    return this.service.get(this.entity.id).map(_ => _.tags);
  }
}