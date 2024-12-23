'use client';

import React, { Dispatch, useEffect, SetStateAction, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CustomFormField from '../CustomFormField';
import SubmitButton from '../SubmitButton';
import { PatientFormValidation } from '@/lib/validation';
import {
  // getUser,
  registerPatient,
  getPatient,
  updatePatient,
} from '@/lib/actions/patient.actions';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { getDoctorList } from '@/lib/actions/doctor.actions';
import {
  GenderOptions,
  IdentificationTypes,
  PatientFormDefaultValues,
} from '@/constants';
import { Label } from '../ui/label';
import { SelectItem } from '../ui/select';
import Image from 'next/image';
import FileUploader from '../FileUploader';
import { z } from 'zod';
import { FormFieldType } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

const RegisterForm = ({
  // user,
  type,
  setOpen,
}: {
  // user: User;
  type?: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [patient, setPatient] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await getDoctorList();
        setDoctorsList(doctors.documents);
        // console.log(doctors);
      } catch (error) {
        console.error('Error fetching doctors list:', error);
      }
    };
    const fetchPatient = async () => {
      try {
        const savedPatient = await getPatient(user?.$id);
        // console.log('patient', savedPatient);
        setPatient(savedPatient);
      } catch (error) {
        console.error('Error fetching the patient:', error);
      }
    };

    fetchDoctors();
    if (type) {
      fetchPatient();
    }
  }, []);
  useEffect(() => {
    if (type && patient) {
      form.reset({
        name: patient.name || user?.name || '',
        email: patient.email || user?.email || '',
        phone: patient.phone || user?.phone || '',
        birthDate: patient.birthDate || '',
        gender: patient.gender || '',
        address: patient.address || '',
        occupation: patient.occupation || '',
        emergencyContactName: patient.emergencyContactName || '',
        emergencyContactNumber: patient.emergencyContactNumber || '',
        primaryPhysician: patient.primaryPhysician || '',
        insuranceProvider: patient.insuranceProvider || '',
        insurancePolicyNumber: patient.insurancePolicyNumber || '',
        allergies: patient.allergies || '',
        currentMedication: patient.currentMedication || '',
        familyMedicalHistory: patient.familyMedicalHistory || '',
        pastMedicalHistory: patient.pastMedicalHistory || '',
      });
    }
    // else if (user) {
    //   form.reset({
    //     name: user?.name || '',
    //     email: user?.email || '',
    //     phone: user?.phone || '',
    //   });
    // } else {
    //   form.reset(PatientFormDefaultValues);
    // }
  }, [patient]);

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {
    // console.log('type', type);
    // console.log('user', user);
    setIsLoading(true);
    let formData;
    if (
      !type &&
      values.identificationDocument &&
      values.identificationDocument?.length > 0
    ) {
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      });

      formData = new FormData();
      formData.append('blobFile', blobFile);
      formData.append('fileName', values.identificationDocument[0].name);
    }
    try {
      const patientData = {
        userId: user?.$id || '',
        name: values.name,
        email: values.email,
        phone: values.phone,
        birthDate: new Date(values.birthDate),
        gender: values.gender,
        address: values.address,
        occupation: values.occupation,
        emergencyContactName: values.emergencyContactName,
        emergencyContactNumber: values.emergencyContactNumber,
        primaryPhysician: values.primaryPhysician,
        insuranceProvider: values.insuranceProvider,
        insurancePolicyNumber: values.insurancePolicyNumber,
        allergies: values.allergies,
        currentMedication: values.currentMedication,
        familyMedicalHistory: values.familyMedicalHistory,
        pastMedicalHistory: values.pastMedicalHistory,
      };
      // console.log('patientData', patientData);
      let patientToSave;
      if (!type) {
        patientToSave = {
          ...patientData,
          identificationType: values.identificationType,
          identificationNumber: values.identificationNumber,
          identificationDocument: values.identificationDocument
            ? formData
            : undefined,
          privacyConsent: values.privacyConsent,
          disclosureConsent: values.disclosureConsent,
          treatmentConsent: values.treatmentConsent,
        };
        // console.log('patientToSave', patientToSave);
        const newPatient = await registerPatient(patientToSave);
        if (newPatient) {
          router.push(`/patients/${user.$id}`);
        }
      } else {
        if (patient) {
          patientToSave = {
            patientId: patient.$id || '',
            user: user,
            ...patientData,
          };

          const updatedPatient = await updatePatient(patientToSave);
          if (updatedPatient) {
            setOpen && setOpen(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 flex-1"
      >
        {/* <section className="mb-12 space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">Let us know more about yourself.</p>
        </section> */}
        <section className="mb-12 space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Personal Information</h2>
          </div>
        </section>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="name"
          label="Full Name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="email"
            label="Email address"
            placeholder="johndoe@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.PHONE_INPUT}
            name="phone"
            label="Phone number"
            placeholder="(555) 123-4567"
          />
        </div>
        {!type && (
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.DATE_PICKER}
              name="birthDate"
              label="Date of Birth"
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SKELETON}
              name="gender"
              label="Gender"
              placeholder=""
              renderSkeleton={field => (
                <FormControl>
                  <RadioGroup
                    className="flex h-11 gap-6 xl:justify-between"
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {GenderOptions.map(option => (
                      <div key={option} className="radio-group">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
            />
          </div>
        )}

        {type && (
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
            name="birthDate"
            label="Date of Birth"
          />
        )}
        {type && (
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SKELETON}
            name="gender"
            label="Gender"
            placeholder=""
            renderSkeleton={field => (
              <FormControl>
                <RadioGroup
                  className="flex h-11 gap-6 xl:justify-between"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  {GenderOptions.map(option => (
                    <div key={option} className="radio-group">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          />
        )}
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="address"
            label="Address"
            placeholder="14th Street, New York"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="occupation"
            label="Occupation"
            placeholder="Software Engineer"
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="emergencyContactName"
            label="Emergency Contact Name"
            placeholder="Jane Doe"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.PHONE_INPUT}
            name="emergencyContactNumber"
            label="Emergency Contact Number"
            placeholder="(555) 123-4567"
          />
        </div>
        <section className="mb-12 space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Medical Information</h2>
          </div>
        </section>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SELECT}
          name="primaryPhysician"
          label="Primary Physician"
          placeholder="Select a Physician"
        >
          {doctorsList &&
            doctorsList.map((doctor, i) => (
              <SelectItem key={doctor.name + i} value={doctor.$id}>
                <div className="flex cursor-pointer items-center gap-2">
                  <Image
                    src={doctor.photoFileUrl}
                    width={32}
                    height={32}
                    alt="doctor"
                    className="rounded-full border border-dark-500"
                  />
                  <p>{doctor.name}</p>
                </div>
              </SelectItem>
            ))}
        </CustomFormField>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="insuranceProvider"
            label="Insurance Provider"
            placeholder="BlueCross BlueShield"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="insurancePolicyNumber"
            label="Insurance Policy Number"
            placeholder="ABC123456789"
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="allergies"
            label="Allergies"
            placeholder="Peanuts,Penicillin"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="currentMedication"
            label="Current Medication"
            placeholder="Ibuprofen 200mg, Paracetamol 500mg"
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="familyMedicalHistory"
            label="Family Medical History"
            placeholder="Mother had Diabetes"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="pastMedicalHistory"
            label="Past Medical History"
            placeholder="Appendectomy"
          />
        </div>

        {!type && (
          <>
            {' '}
            <section className="mb-12 space-y-6">
              <div className="mb-9 space-y-1">
                <h2 className="sub-header">Identification and Verification</h2>
                <div className="flex flex-col gap-6 xl:flex-row"></div>
              </div>
            </section>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              name="identificationType"
              label="Identification Type"
              placeholder="Select an identification type"
            >
              {IdentificationTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </CustomFormField>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="identificationNumber"
              label="Identification Number"
              placeholder="123456789"
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SKELETON}
              name="identificationDocument"
              label="Scanned copy of identification document"
              placeholder=""
              renderSkeleton={field => (
                <FormControl>
                  <FileUploader files={field.value} onChange={field.onChange} />
                </FormControl>
              )}
            />
            <section className="mb-12 space-y-6">
              <div className="mb-9 space-y-1">
                <h2 className="sub-header">Consent and Privacy</h2>
                <div className="flex flex-col gap-6 xl:flex-row"></div>
              </div>
            </section>
            <CustomFormField
              fieldType={FormFieldType.CHECKBOX}
              control={form.control}
              name="treatmentConsent"
              label="I consent to receive treatment for my health condition."
            />
            <CustomFormField
              fieldType={FormFieldType.CHECKBOX}
              control={form.control}
              name="disclosureConsent"
              label="I consent to the use and disclosure of my health
            information for treatment purposes."
            />
            <CustomFormField
              fieldType={FormFieldType.CHECKBOX}
              control={form.control}
              name="privacyConsent"
              label="I acknowledge that I have reviewed and agree to the
            privacy policy"
            />
          </>
        )}
        <SubmitButton isLoading={isLoading}>Submit</SubmitButton>
        {/* <SubmitButton isLoading={isLoading}>Get Started</SubmitButton> */}
      </form>
    </Form>
  );
};

export default RegisterForm;
