// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Permission } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class PermissionGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private prismaService: PrismaService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const softPermissions =
//       this.reflector.get<string[]>('permissions', context.getHandler()) || [];
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//     const hasSoftPermission = softPermissions && softPermissions.length > 0;
//     const hastStrictPermission =
//       strictPermissions && strictPermissions.length > 0;

//     // check permissions
//     const userId = Number(user.id);
//     const userPermissions = await this.prismaService.userPermission.findMany({
//       where: { userId },
//       include: { permission: true },
//     });
//     const permissionList: Permission[] = userPermissions.map((item) => {
//       return item.permission;
//     });
//     const adminRoles = await this.prismaService.userRole.findMany({
//       where: { userId },
//     });
//     if (adminRoles) {
//       const adminRolesIds = adminRoles.map((adminRole) => adminRole.roleId);
//       const rolePermissions = await this.prismaService.rolePermission.findMany({
//         where: { roleId: { in: adminRolesIds } },
//         include: { permission: true },
//       });

//       rolePermissions.forEach((rp) => {
//         permissionList.push(rp.permission);
//       });
//     }

//     // list of all allowed permission of this admin
//     const usedPermision = {};
//     const softValids: boolean[] = softPermissions.map((key) => {
//       const valid = permissionList.find((item) => {
//         let result = item.key === key;
//         return result;
//       });
//       if (valid) usedPermision[valid.key] = valid;
//       return Boolean(valid);
//     });
//     const strictValids: boolean[] = strictPermissions.map((key) => {
//       const valid = permissionList.find((item) => {
//         let result = item.key === key;
//         return result;
//       });
//       if (valid) usedPermision[valid.key] = valid;
//       return Boolean(valid);
//     });
//     request.usedPermision = usedPermision;
//     if (hasSoftPermission && hastStrictPermission) {
//       return (
//         softValids.find((valid) => valid) &&
//         strictValids.every((valid) => valid)
//       );
//     } else if (hasSoftPermission) {
//       return softValids.find((valid) => valid);
//     } else if (hastStrictPermission) {
//       return strictValids.every((valid) => valid);
//     } else {
//       return true;
//     }
//   }
// }
