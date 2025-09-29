import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRestaurante } from './editar-restaurante';

describe('EditarRestaurante', () => {
  let component: EditarRestaurante;
  let fixture: ComponentFixture<EditarRestaurante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarRestaurante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarRestaurante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
