"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { experimentFormDefaultsFixture } from "@/components/domain/fixtures"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  experimentInputSchema,
  type ExperimentInput,
} from "@/schemas/domain-component-inputs"

const experimentFormSchema = z.object({
  lotId: z.string().refine((value) => value.trim().length > 0, {
    message: "请填写 Lot ID",
  }),
  experimentName: z.string().optional(),
  experimentDescription: z.string().optional(),
})

export type ExperimentFormValues = z.infer<typeof experimentFormSchema>

export function Experiment({
  input = {},
  onSubmit,
}: {
  input?: ExperimentInput
  onSubmit?: (values: ExperimentFormValues) => void
}) {
  experimentInputSchema.parse(input)

  const form = useForm<ExperimentFormValues>({
    resolver: zodResolver(experimentFormSchema),
    defaultValues: experimentFormDefaultsFixture,
  })

  function handleSubmit(values: ExperimentFormValues) {
    onSubmit?.({
      ...values,
      lotId: values.lotId.trim(),
      experimentName: values.experimentName?.trim(),
      experimentDescription: values.experimentDescription?.trim(),
    })
  }

  return (
    <section className="not-prose domain-ui-typography rounded-lg border bg-card p-6">
      <div className="max-w-5xl">
        <Badge
          variant="outline"
          className="h-[var(--doe-control-sm)] rounded-full border-sky-100 bg-sky-50 px-3 text-sm font-medium text-sky-700"
        >
          DOE工作起点
        </Badge>
        <h2 className="mt-4 text-4xl font-semibold tracking-normal">新建DOE试验</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          填写Lot ID后读取产品与Wafer信息，再进入Split Table、Recipe和MES下发配置。
        </p>

        <form
          className="mt-6"
          noValidate
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="lotId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="experiment-lot-id" className="text-sm font-semibold">
                    Lot ID <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="experiment-lot-id"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    className="rounded-lg"
                    placeholder="例如 AF01112"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="experimentName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="experiment-name"
                    className="items-baseline text-sm font-semibold"
                  >
                    试验名称 <span className="font-normal text-muted-foreground">非必填</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="experiment-name"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    className="rounded-lg"
                    placeholder="例如 刻蚀功率窗口确认试验"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="experimentDescription"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="experiment-description"
                    className="items-baseline text-sm font-semibold"
                  >
                    试验描述 <span className="font-normal text-muted-foreground">非必填</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="experiment-description"
                    aria-invalid={fieldState.invalid}
                    className="rounded-lg"
                    placeholder="填写试验目的、范围或需要验证的问题"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="px-5">
              开始试验配置
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
