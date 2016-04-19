***Settings***
| Library | test_api.py |
| Variables | variable.py |
| Suite Setup | Suite_setup | ${host} | ${api_dict} |

***Variables***
| ${host} | http://localhost:8000 |

***Keywords***
Suite_setup
|  | [Arguments] | ${host} | ${api_dict} |
|  | ${resp_stack}= | Prepare parent api | ${host} | ${api_dict} |
|  | Set Suite Variable | ${resp_stack} |

***Test Cases***
Test api baidu
|  | [Documentation] | *uri*: /\n\n*method*: GET\n\n*tags*: [u'smoke', u'regression']\n\n*auth*: []\n\n*headers*:\n\n{}\n\n*data*:\n\n{}\n\n*status code*: 200\n\n*verification*: []\n\n |
|  | [tags] | smoke | regression |
|  | Test Api | ${host} | ${api_dict} | baidu | ${resp_stack} |

Test api demo
|  | [Documentation] | *uri*: /api/v1/demo.json\n\n*method*: POST\n\n*tags*: [u'smoke', u'regression']\n\n*auth*: [u'alex@gatherhealth.com', u'123456']\n\n*headers*:\n\n{u'Content-Type': u'application/json'}\n\n*data*:\n\n{u'bg_units': u'0', u'billing_enabled': True, u'country': u'IN', u'notes': u'abc_{doctor_name}_{nurse_name}', u'height_units': u'0', u'doctor_name': u'doctor{random}', u'period': 12, u'language_code': u'en', u'app_branding': u'gather-health', u'data': u'4100', u'nurse_name': u'nurse_{doctor_name}'}\n\n*status code*: 200\n\n*verification*: [u'key', u'id']\n\n |
|  | [tags] | smoke | regression |
|  | Test Api | ${host} | ${api_dict} | demo | ${resp_stack} |

Test api register
|  | [Documentation] | *uri*: /api/v1/patients/{patient_id}/registrations.json\n\n*method*: POST\n\n*tags*: [u'regression']\n\n*auth*: [u'doctor@gatherhealth.com', u'{demo[key]}']\n\n*headers*:\n\n{u'Content-Type': u'application/json'}\n\n*data*:\n\n{u'practice': u'{demo[id]}', u'patient_register_date': u'2016-04-19', u'guru_last_contact': u'2016-04-19', u'patient_id': u'{patient[id]}'}\n\n*status code*: 201\n\n*verification*: []\n\n |
|  | [tags] | regression |
|  | Test Api | ${host} | ${api_dict} | register | ${resp_stack} |

Test api patient
|  | [Documentation] | *uri*: /api/v1/patients.json\n\n*method*: POST\n\n*tags*: [u'smoke']\n\n*auth*: [u'doctor@gatherhealth.com', u'{demo[key]}']\n\n*headers*:\n\n{u'Content-Type': u'application/json'}\n\n*data*:\n\n{u'first_name': u'test{random}', u'last_name': u'test', u'language': u'en', u'phone1_country': u'91', u'phone1': u'1234567890', u'is_study': False, u'practice_id': u'{demo[id]}', u'sex': u'0', u'study_id': u'', u'state': 2, u'dob': u'1987-09-09', u'patient_phone_type': u'', u'email': u'{first_name}@{last_name}.com'}\n\n*status code*: 201\n\n*verification*: [u'id', {u'first_name': u'{first_name}'}, {u'subscription': u'expire_date'}, {u'subscription': {u'expire_date': None}}]\n\n |
|  | [tags] | smoke |
|  | Test Api | ${host} | ${api_dict} | patient | ${resp_stack} |

