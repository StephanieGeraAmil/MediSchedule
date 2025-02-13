'use client';
import React, { ReactNode } from 'react';
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
import { Control } from 'react-hook-form';
import Image from 'next/image';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { E164Number } from 'libphonenumber-js/core';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDatePicker from 'react-datepicker';
import { Select, SelectContent, SelectValue, SelectTrigger } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { FormFieldType } from '@/constants';

interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldType;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  hidden?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  maxDate?: Date;
  filterDate?: (date: Date) => boolean;
  dayClassName?: (date: Date) => string;
  isTimeSelectable?: (date: Date) => boolean;
  timeClassName?: (date: Date) => string;
  renderSkeleton?: (field: any) => React.ReactNode;
  onChange?: (value: any) => void;
}
const toUTC = localDate => {
  if (!localDate) return null;
  return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
};

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const {
    control,
    fieldType,
    name,
    label,
    placeholder,
    description,
    iconSrc,
    iconAlt,
    showTimeSelect,
    dateFormat,
    renderSkeleton,
    children,
    maxDate,
    filterDate,
    isTimeSelectable,
  } = props;
  switch (fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          {iconSrc && (
            <Image
              src={iconSrc}
              alt={iconAlt || 'icon'}
              className="ml-2"
              height={24}
              width={24}
            />
          )}
          <FormControl className="">
            <Input
              placeholder={placeholder}
              {...field}
              className="shad-input border-0"
            />
          </FormControl>
        </div>
      );
      break;
    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl className="">
          <PhoneInput
            placeholder={placeholder}
            defaultCountry="US"
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className="input-phone"
          />
        </FormControl>
      );
      break;

    case FormFieldType.SKELETON:
      return renderSkeleton ? renderSkeleton(field) : null;
      break;
    case FormFieldType.DATE_PICKER:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          <Image
            src="/assets/icons/calendar.svg"
            alt="calendar"
            width={24}
            height={24}
            className="ml-2"
          />
          <FormControl>
            <ReactDatePicker
              selected={field.value}
              onChange={date => field.onChange(date)}
              showTimeSelect={showTimeSelect ?? false}
              dateFormat={dateFormat ?? 'dd/MM/yyyy'}
              timeInputLabel="Time:"
              wrapperClassName="date-picker"
              timeZone="UTC"
              filterDate={props.filterDate}
              dayClassName={props.dayClassName}
              isTimeSelectable={props.isTimeSelectable}
              timeClassName={props.timeClassName}
            />
          </FormControl>
        </div>
      );
      break;
    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          {!props.hidden && (
            <div className="flex items-center gap-4">
              <Checkbox
                id={name}
                checked={field.value}
                disabled={props.disabled}
                onCheckedChange={value => {
                  field.onChange(value); // Update the form state
                  if (props.onChange) {
                    props.onChange(value); // Call the custom onChange handler if provided
                  }
                }}
              />
              <label htmlFor={props.name} className="checkbox-label">
                {props.label}
              </label>
            </div>
          )}
        </FormControl>
      );

    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            className="shad-textArea"
            disabled={props.disabled}
          />
        </FormControl>
      );
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select
            onValueChange={value => {
              field.onChange(value); // Update the form state
              if (props.onChange) {
                props.onChange(value); // Call the custom onChange handler if provided
              }
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="shad-select-trigger">
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="shad-select-content">
              {children}
            </SelectContent>
          </Select>
        </FormControl>
      );
    default:
      break;
  }
};

const CustomFormField = (props: CustomProps) => {
  const {
    control,
    fieldType,
    name,
    label,
    placeholder,
    description,
    iconSrc,
    iconAlt,
  } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel>{label}</FormLabel>
          )}
          <RenderField field={field} props={props} />
          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
