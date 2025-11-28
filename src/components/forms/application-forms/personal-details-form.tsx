"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormRadio } from "../../ui/forms/form-radio";

const personalDetailsSchema = z.object({
  country: z.string().min(1),
  country_of_birth: z.string().min(1),
  date_of_birth: z.string().min(1),
  email: z.string().email(),
  family_name: z.string().min(1),
  gender: z.string().min(1),
  given_name: z.string().min(1),
  middle_name: z.string().optional(),
  nationality: z.string().min(1),
  passport_expiry: z.string().min(1),
  passport_number: z.string().min(1),
  phone: z.string().min(1),
  postcode: z.string().min(1),
  state: z.string().min(1),
  street_address: z.string().min(1),
  suburb: z.string().min(1),
});

type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export default function PersonalDetailsForm() {
  const methods = useForm<PersonalDetailsValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      country: "",
      country_of_birth: "",
      date_of_birth: "",
      email: "",
      family_name: "",
      gender: "",
      given_name: "",
      middle_name: "",
      nationality: "",
      passport_expiry: "",
      passport_number: "",
      phone: "",
      postcode: "",
      state: "",
      street_address: "",
      suburb: "",
    },
  });

  const onSubmit = (values: PersonalDetailsValues) => {
    console.log(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
        <section className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Personal Information</h3>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="given_name"
              label="Given Name"
              placeholder="John"
            />
            <FormInput
              name="middle_name"
              label="Middle Name"
              placeholder="Michael"
            />
            <FormInput
              name="family_name"
              label="Family Name"
              placeholder="Doe"
            />

            <FormRadio
              name="gender"
              label="Gender"
              options={["Male", "Female", "Other"]}
            />

            <FormInput name="date_of_birth" label="Date of Birth" type="date" />
            <FormInput
              name="phone"
              label="Phone"
              placeholder="+61 400 123 456"
            />
            <FormInput
              name="email"
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
            />
          </div>
        </section>

        {/* PASSPORT & NATIONALITY */}
        <section className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Passport & Nationality</h3>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="country"
              label="Country of Residence"
              placeholder="Australia"
            />
            <FormInput
              name="country_of_birth"
              label="Country of Birth"
              placeholder="Nepal"
            />
            <FormInput
              name="nationality"
              label="Nationality"
              placeholder="Nepalese"
            />
            <FormInput
              name="passport_number"
              label="Passport Number"
              placeholder="AB1234567"
            />
            <FormInput
              name="passport_expiry"
              label="Passport Expiry"
              type="date"
            />
          </div>
        </section>

        {/* ADDRESS */}
        <section className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Address</h3>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="street_address"
              label="Street Address"
              placeholder="123 Main Street"
            />
            <FormInput name="suburb" label="Suburb" placeholder="Sydney" />
            <FormInput name="state" label="State" placeholder="NSW" />
            <FormInput name="postcode" label="Postcode" placeholder="2000" />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit">Submit Personal Details</Button>
        </div>
      </form>
    </FormProvider>
  );
}
