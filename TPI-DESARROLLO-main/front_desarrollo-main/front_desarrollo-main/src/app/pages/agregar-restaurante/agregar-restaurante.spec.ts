import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarRestaurante } from './agregar-restaurante';

describe('AgregarRestaurante', () => {
  let component: AgregarRestaurante;
  let fixture: ComponentFixture<AgregarRestaurante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarRestaurante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarRestaurante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
