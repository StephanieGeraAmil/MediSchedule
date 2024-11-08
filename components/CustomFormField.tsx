'use client'
import React, { ReactNode } from 'react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {Control} from 'react-hook-form'
import { FormFieldType } from './forms/PatientForm'
import Image from 'next/image'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { E164Number } from "libphonenumber-js/core";

interface CustomProps{
    control:Control<any>,
    fieldType:FormFieldType,
    name: string,
    label?:string,
    placeholder?:string,
    description?:string,
    iconSrc?:string,
    iconAlt?:string,
    disabled?:boolean,
    dateFormat?:string,
    showTimeSelect?:boolean,
    childern?:React.ReactNode,
    renderSkeleton?:(field:any)=>React.ReactNode,
}

const RenderField=({field,props}:{field:any, props:CustomProps})=>{
    const {control, fieldType, name, label, placeholder, description, iconSrc, iconAlt}= props
    switch(fieldType){
        case FormFieldType.INPUT: 
        return(
            <div className="flex rounded-md border border-dark-500 bg-dark-400">
                {iconSrc && (
                    <Image 
                    src={iconSrc} 
                    alt={iconAlt ||'icon'} 
                    className="ml-2"
                    height={24} 
                    width={24}/>
                )}
            <FormControl className=''>
                <Input 
                placeholder={placeholder} 
                {...field}
                className='shad-input border-0' />
                </FormControl>
            </div>
        )
        break;
         case FormFieldType.PHONE_INPUT: 
        return(
           
            <FormControl className=''>
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
           
        )
        break;
        case FormFieldType.CHECKBOX: break;
        default: break;
    }
}

const CustomFormField = (props:CustomProps) => {
    const {control, fieldType, name, label, placeholder, description,iconSrc, iconAlt}= props
  return (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className='flex-1'>
            {fieldType!==FormFieldType.CHECKBOX && label && (
                <FormLabel>{label}</FormLabel>
            )}
            <RenderField field={field} props={props}/>
            {/* <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input placeholder={placeholder} {...field} />
            </FormControl>
            <FormDescription>
             {description}
            </FormDescription> */}
            <FormMessage className="shad-error" />
          </FormItem>
        )}
      />
  )
}

export default CustomFormField