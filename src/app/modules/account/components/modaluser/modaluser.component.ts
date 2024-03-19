import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../service/users.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { UserRoleType } from '@core/enums/user-role-type.enum';
import { SubAccountService } from '@core/services-v2/sub-account.service';
import { ToastrService } from 'ngx-toastr';
import { IEcommerceUser } from '@core/models-v2/auth/user.interface';
import { SessionService } from '@core/services-v2/session/session.service';

@Component({
  selector: 'app-modaluser',
  templateUrl: './modaluser.component.html',
  styleUrls: ['./modaluser.component.scss'],
})
export class ModaluserComponent implements OnInit, OnDestroy {
  formUsuario!: FormGroup;
  editUser: Boolean = false;
  users!: IEcommerceUser;
  user_raiz: any = [];
  modalRef!: BsModalRef;
  @ViewChild('template_usuario', { static: false })
  modalUsuario!: TemplateRef<any>;
  @ViewChild('template_crearusuario', { static: false })
  modalCrearUsuario!: TemplateRef<any>;
  @ViewChild('template_eliminarusuario', { static: false })
  modalEliminarUsuario!: TemplateRef<any>;

  subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private userService: UsersService,
    private toastr: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly subAccountService: SubAccountService
  ) {
  }

  ngOnInit() {
    this.formUser();
    //this.subscriptions.unsubscribe();
    const subscription = this.userService.templateRead$.subscribe((r: any) => {
      this.users = r.data;
      this.users.userRole = UserRoleType.BUYER;
      this.user_raiz = r.raiz;
      this.editUser = r.edit;

      if (r.edit) this.openModalEditar();
      else if (!r.edit && !r.delete) {
        this.openModalCrear();
      } else if (r.delete) {
        this.openModalDelete();
      }
      this.formEditar();
    });
    this.subscriptions.add(subscription);
    this.formUsuario?.get('email')?.valueChanges.subscribe((valor) => {
      this.formUsuario.get('username')?.setValue(valor);
    });
  }

  formUser() {
    this.formUsuario = this.fb.group({
      active: [true],
      username: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      password: ['', Validators.required],
      phone: ['', [Validators.required,Validators.maxLength(12)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      // method_payment: ['OC', Validators.required],
      userRole: UserRoleType.BUYER,
    });
    this.editUser = false;
  }

  formEditar() {
    // this.formUsuario.controls['active'].setValue(this.users.active);
    this.formUsuario.controls['username'].setValue(this.users.username);
    this.formUsuario.controls['firstName'].setValue(this.users.firstName);
    this.formUsuario.controls['lastName'].setValue(this.users.lastName);
    this.formUsuario.controls['email'].setValue(this.users.email);
    this.formUsuario.controls['phone'].setValue(this.users.phone);
    this.formUsuario.controls['password'].setValue('');
    this.formUsuario.controls['userRole'].setValue(this.users.userRole);
  }

  openModalCrear(): void {
    this.formUsuario.controls['active'].setValue(true);
    this.modalRef = this.modalService.show(this.modalCrearUsuario, {
      backdrop: 'static',
      keyboard: false,
      class: 'modal-lg'
    });
  }

  openModalEditar(): void {
    this.modalRef = this.modalService.show(this.modalUsuario, {
      backdrop: 'static',
      keyboard: false,
      class: 'modal-lg'
    });
  }

  openModalDelete(): void {
    this.modalRef = this.modalService.show(this.modalEliminarUsuario, {
      backdrop: 'static',
      keyboard: false,
      class: 'modal-lg'
    });
  }

  Close() {
    this.modalRef.hide();
  }

  async onSubmit(data: any) {
    data.company = this.user_raiz.company;
    data.documentId = this.users.documentId
      ? this.users.documentId
      : this.sessionService.getSession().documentId;
    data.giro = this.user_raiz.giro;
    data.tipo_usuario = 1;
    console.log('info pe:',data)
    if (this.editUser) {
      this.subAccountService
        .updateSubAccount({
          ...data,
        })
        .subscribe({
          next: () => {
            this.modalRef.hide();
            this.userService.LoadData();
          },
          error: () => {
            this.toastr.error(
              'No se pudo actualizar el usuario ' + data.username
            );
            this.modalRef.hide();
            this.userService.LoadData();
          },
        });
    } else if (!this.editUser) {
      this.subAccountService
        .createSubAccount({
          ...data,
        })
        .subscribe({
          next: () => {
            this.modalRef.hide();
            this.userService.LoadData();
          },
          error: () => {
            this.toastr.error(
              'No se pudo crear el usuario ' + data.username
            );
            this.modalRef.hide();
            this.userService.LoadData();
          },
        });
    }
  }

  async Eliminar(data: IEcommerceUser) {
    this.subAccountService
      .deleteSubAccount({
        documentId: data.documentId,
        username: data.username || '',
      })
      .subscribe({
        next: () => {
          this.modalRef.hide();
          this.userService.LoadData();
        },
        error: () => {
          this.toastr.error('No se pudo eliminar el usuario ' + data.username);
          this.modalRef.hide();
          this.userService.LoadData();
        },
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
