import { ROLE_MESSAGE, AUTH_MESSAGE } from "@app/messages";
import { PERMISSION, ROLE } from "@app/permissions";
import type { TRoleCreateInput, TRoleDto } from "@app/schemas";
import { Effect } from "effect";
import { roleExists } from "#/role/application/role-ensure.ts";
import { toRoleDto } from "#/role/application/to-role-dto.ts";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { EConflict, EForbidden, type EDatabase } from "#/shared/errors.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	CustomRoleRepo,
	type TCustomRoleRepoId,
} from "#/role/domain/custom-role.ts";

export const roleCreate = Effect.fn("roleCreate")(function* (
	input: TRoleCreateInput,
	actorId: string,
	actorRole: string,
): Effect.fn.Return<
	TRoleDto,
	EConflict | EForbidden | EDatabase,
	TCustomRoleRepoId | TActivityRecorderId
> {
	const customRoleRepo = yield* CustomRoleRepo;
	const activityRepo = yield* ActivityRecorder;

	if (
		input.permissions.includes(PERMISSION.FEATURE_FLAG_MANAGE) &&
		actorRole !== ROLE.SUPERADMIN
	) {
		return yield* new EForbidden({ message: AUTH_MESSAGE.FORBIDDEN });
	}

	const taken = yield* roleExists(input.key);

	if (taken) {
		return yield* new EConflict({ message: ROLE_MESSAGE.KEY_TAKEN });
	}

	const row = yield* customRoleRepo.create(input, actorId);
	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.ROLE_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.ROLE,
		resourceId: row.key,
	});

	return toRoleDto(row, {});
});
