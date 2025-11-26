"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const personalDetailsSchema = z.object({
  studentOrigin: z.string().min(1, "Student origin is required"),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  contactEmail: z.string().email("Valid email required"),
  alternateEmail: z.string().email().optional(),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  homePhone: z.string().optional(),
  countryOfBirth: z.string().min(1, "Country of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  passportExpiry: z.string().min(1, "Passport expiry is required"),
  resCountry: z.string().min(1, "Residential country is required"),
  resBuilding: z.string().optional(),
  resUnit: z.string().optional(),
  resStreetNumber: z.string().min(1, "Street number is required"),
  resStreetName: z.string().min(1, "Street name is required"),
  resCity: z.string().min(1, "City is required"),
  resState: z.string().min(1, "State is required"),
  resPostCode: z.string().min(1, "Post code is required"),
  postalSameAsResidential: z.boolean().optional(),
  posCountry: z.string().optional(),
  posBuilding: z.string().optional(),
  posUnit: z.string().optional(),
  posStreetNumber: z.string().optional(),
  posStreetName: z.string().optional(),
  posCity: z.string().optional(),
  posState: z.string().optional(),
  posPostCode: z.string().optional(),
  overseasCountry: z.string().optional(),
  overseasAddress: z.string().optional(),
});

type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export default function PersonalDetailsForm() {
  const { register, watch, setValue, handleSubmit, reset } =
    useForm<PersonalDetailsValues>({
      resolver: zodResolver(personalDetailsSchema),
      defaultValues: {
        studentOrigin: "",
        title: "",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        contactEmail: "",
        alternateEmail: "",
        mobileNumber: "",
        homePhone: "",
        countryOfBirth: "",
        nationality: "",
        passportNumber: "",
        passportExpiry: "",
        resCountry: "",
        resBuilding: "",
        resUnit: "",
        resStreetNumber: "",
        resStreetName: "",
        resCity: "",
        resState: "",
        resPostCode: "",
        postalSameAsResidential: false,
        posCountry: "",
        posBuilding: "",
        posUnit: "",
        posStreetNumber: "",
        posStreetName: "",
        posCity: "",
        posState: "",
        posPostCode: "",
        overseasCountry: "",
        overseasAddress: "",
      },
    });

  // Watch specific fields for conditional rendering
  const studentOrigin = watch("studentOrigin");
  const title = watch("title");
  const gender = watch("gender");
  const countryOfBirth = watch("countryOfBirth");
  const nationality = watch("nationality");
  const resCountry = watch("resCountry");
  const postalSameAsResidential = watch("postalSameAsResidential");
  const posCountry = watch("posCountry");
  const overseasCountry = watch("overseasCountry");

  const onSubmit = (values: PersonalDetailsValues) => {
    console.log("Personal details submitted", values);
    reset(values);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Basic Information</h3>
          <Separator />
        </div>

        {/* Student Origin */}
        <div className="space-y-2">
          <Label className="required">Student Origin</Label>
          <RadioGroup
            value={studentOrigin}
            onValueChange={(value) => setValue("studentOrigin", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="offshore" id="offshore" />
              <Label htmlFor="offshore" className="font-normal cursor-pointer">
                Overseas Student (Offshore)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onshore" id="onshore" />
              <Label htmlFor="onshore" className="font-normal cursor-pointer">
                Overseas Student in Australia (Onshore)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="domestic" id="domestic" />
              <Label htmlFor="domestic" className="font-normal cursor-pointer">
                Resident Student (Domestic)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label className="required">Title</Label>
          <RadioGroup
            value={title}
            onValueChange={(value) => setValue("title", value)}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mr" id="mr" />
                <Label htmlFor="mr" className="font-normal cursor-pointer">
                  Mr
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ms" id="ms" />
                <Label htmlFor="ms" className="font-normal cursor-pointer">
                  Ms
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mrs" id="mrs" />
                <Label htmlFor="mrs" className="font-normal cursor-pointer">
                  Mrs
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  Other
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Full Name */}
        <div className="space-y-3">
          <div>
            <Label className="font-medium">Enter your Full Name</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Please write the name that you used when you applied for your
              Unique Student Identifier (USI), including any middle names. If
              you do not yet have a USI please write your name exactly as
              written in the identity document you choose to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="required">
                First Name
              </Label>
              <Input
                id="firstName"
                {...register("firstName", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name (optional)</Label>
              <Input id="middleName" {...register("middleName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="required">
                Last Name
              </Label>
              <Input
                id="lastName"
                {...register("lastName", { required: true })}
              />
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="required">Gender</Label>
          <RadioGroup
            value={gender}
            onValueChange={(value) => setValue("gender", value)}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal cursor-pointer">
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal cursor-pointer">
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other-gender" id="other-gender" />
                <Label
                  htmlFor="other-gender"
                  className="font-normal cursor-pointer"
                >
                  Other
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="required">
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register("dateOfBirth", { required: true })}
          />
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Contact Details</h3>
          <Separator />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="required">
              Contact Email Address
            </Label>
            <Input
              id="contactEmail"
              type="email"
              {...register("contactEmail", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternateEmail">
              Alternate Email Address (optional)
            </Label>
            <Input
              id="alternateEmail"
              type="email"
              {...register("alternateEmail")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="required">
              Mobile Number
            </Label>
            <Input
              id="mobileNumber"
              {...register("mobileNumber", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homePhone">Home Phone (optional)</Label>
            <Input id="homePhone" {...register("homePhone")} />
          </div>
        </div>
      </div>

      {/* Passport Details */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Passport Details</h3>
          <Separator />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="countryOfBirth" className="required">
              Country of Birth
            </Label>
            <Select
              value={countryOfBirth}
              onValueChange={(value) => setValue("countryOfBirth", value)}
            >
              <SelectTrigger id="countryOfBirth">
                <SelectValue placeholder="Select Country..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="cn">China</SelectItem>
                <SelectItem value="np">Nepal</SelectItem>
                <SelectItem value="pk">Pakistan</SelectItem>
                <SelectItem value="bd">Bangladesh</SelectItem>
                <SelectItem value="lk">Sri Lanka</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality" className="required">
              Nationality
            </Label>
            <Select
              value={nationality}
              onValueChange={(value) => setValue("nationality", value)}
            >
              <SelectTrigger id="nationality">
                <SelectValue placeholder="Select Nationality..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="australian">Australian</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="nepalese">Nepalese</SelectItem>
                <SelectItem value="pakistani">Pakistani</SelectItem>
                <SelectItem value="bangladeshi">Bangladeshi</SelectItem>
                <SelectItem value="srilankan">Sri Lankan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="passportNumber" className="required">
              Passport Number
            </Label>
            <Input
              id="passportNumber"
              {...register("passportNumber", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passportExpiry" className="required">
              Passport Expiry Date
            </Label>
            <Input
              id="passportExpiry"
              type="date"
              {...register("passportExpiry", { required: true })}
            />
          </div>
        </div>
      </div>

      {/* Residential Address */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Residential Address</h3>
          <p className="text-sm text-muted-foreground">
            Please provide the physical address (street number and name not post
            office box) where you usually reside rather than any temporary
            address at which you reside for training, work or other purposes
            before returning to your home.
          </p>
          <Separator className="mt-2" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resCountry" className="required">
              Country
            </Label>
            <Select
              value={resCountry}
              onValueChange={(value) => setValue("resCountry", value)}
            >
              <SelectTrigger id="resCountry">
                <SelectValue placeholder="Select Country..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="cn">China</SelectItem>
                <SelectItem value="np">Nepal</SelectItem>
                <SelectItem value="pk">Pakistan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resBuilding">
                Building / Property Name (optional)
              </Label>
              <Input id="resBuilding" {...register("resBuilding")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resUnit">Flat / Unit (optional)</Label>
              <Input id="resUnit" {...register("resUnit")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resStreetNumber" className="required">
                Street Number
              </Label>
              <Input
                id="resStreetNumber"
                {...register("resStreetNumber", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resStreetName" className="required">
                Street Name
              </Label>
              <Input
                id="resStreetName"
                {...register("resStreetName", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resCity" className="required">
                City / Town / Suburb
              </Label>
              <Input
                id="resCity"
                {...register("resCity", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resState" className="required">
                State / Province
              </Label>
              <Input
                id="resState"
                {...register("resState", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resPostCode" className="required">
                Post Code
              </Label>
              <Input
                id="resPostCode"
                {...register("resPostCode", { required: true })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Postal Address */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Postal Address</h3>
          <Separator />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="postalSameAsResidential"
            checked={postalSameAsResidential}
            onCheckedChange={(checked) =>
              setValue("postalSameAsResidential", checked)
            }
          />
          <Label
            htmlFor="postalSameAsResidential"
            className="font-normal cursor-pointer"
          >
            Is your Postal address same as residential address?
          </Label>
        </div>

        {!postalSameAsResidential && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="posCountry">Country</Label>
              <Select
                value={posCountry}
                onValueChange={(value) => setValue("posCountry", value)}
              >
                <SelectTrigger id="posCountry">
                  <SelectValue placeholder="Select Country..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="in">India</SelectItem>
                  <SelectItem value="cn">China</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posBuilding">Building / Property Name</Label>
                <Input id="posBuilding" {...register("posBuilding")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posUnit">Flat / Unit</Label>
                <Input id="posUnit" {...register("posUnit")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posStreetNumber">Street Number</Label>
                <Input id="posStreetNumber" {...register("posStreetNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posStreetName">Street Name</Label>
                <Input id="posStreetName" {...register("posStreetName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posCity">City / Town / Suburb</Label>
                <Input id="posCity" {...register("posCity")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posState">State / Province</Label>
                <Input id="posState" {...register("posState")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posPostCode">Post Code</Label>
                <Input id="posPostCode" {...register("posPostCode")} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overseas/Permanent Address */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Overseas / Permanent Address</h3>
          <Separator />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overseasCountry">Select Country</Label>
            <Select
              value={overseasCountry}
              onValueChange={(value) => setValue("overseasCountry", value)}
            >
              <SelectTrigger id="overseasCountry">
                <SelectValue placeholder="Select Country..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="cn">China</SelectItem>
                <SelectItem value="np">Nepal</SelectItem>
                <SelectItem value="pk">Pakistan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overseasAddress">Overseas Address (optional)</Label>
            <textarea
              id="overseasAddress"
              {...register("overseasAddress")}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Submit Personal Details</Button>
      </div>

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </form>
  );
}
